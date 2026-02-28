'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { AnalyzeResponse } from '@/lib/types';
import Link from 'next/link';

type AppState = 'LANDING' | 'RECORDING' | 'ANALYZING' | 'RESULT';

export default function HomePage() {
  const { data: session } = useSession();
  const recorder = useAudioRecorder();

  const [appState, setAppState] = useState<AppState>('LANDING');
  const [result, setResult] = useState<AnalyzeResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [messageSaved, setMessageSaved] = useState(false);
  const [shared, setShared] = useState(false);

  // Auto-submit when recording stops
  useEffect(() => {
    if (recorder.state === 'stopped' && recorder.audioBlob && appState === 'RECORDING') {
      handleSubmit(recorder.audioBlob);
    }
  }, [recorder.state]);

  const handleStart = useCallback(async () => {
    setError(null);
    setResult(null);
    setPersonalMessage('');
    setMessageSaved(false);
    setShared(false);
    try {
      await recorder.start();
      setAppState('RECORDING');
    } catch {
      setError('마이크 권한을 허용해주세요.');
    }
  }, [recorder]);

  const handleStop = useCallback(() => {
    recorder.stop();
  }, [recorder]);

  const handleDemo = useCallback(async () => {
    setAppState('ANALYZING');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('demo', 'true');
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const json: AnalyzeResponse = await res.json();
      if (json.data) {
        setResult(json.data);
        setAppState('RESULT');
      }
    } catch {
      setError('데모 로드 실패');
      setAppState('LANDING');
    }
  }, []);

  const handleSubmit = useCallback(async (blob: Blob) => {
    setAppState('ANALYZING');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const json: AnalyzeResponse = await res.json();
      if (json.data) {
        setResult(json.data);
        setAppState('RESULT');
      } else {
        setError(json.error ?? '분석 실패');
        setAppState('LANDING');
      }
    } catch {
      setError('서버 연결 실패');
      setAppState('LANDING');
    }
  }, []);

  const handleSaveMessage = useCallback(async () => {
    if (!result?.cardId || result.cardId === 'demo' || !personalMessage.trim()) return;
    try {
      await fetch('/api/card/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: result.cardId, message: personalMessage.trim() }),
      });
      setMessageSaved(true);
    } catch { /* ignore */ }
  }, [result, personalMessage]);

  const handleShare = useCallback(async () => {
    if (!result?.cardId || result.cardId === 'demo') return;
    const url = `${window.location.origin}/card/${result.cardId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `#${result.coreEmotion} — 숨소리`,
          text: '목소리가 그림이 되었어요.',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
    } catch { /* cancelled */ }
  }, [result]);

  const handleReset = useCallback(() => {
    setAppState('LANDING');
    setResult(null);
    setError(null);
    setPersonalMessage('');
    setMessageSaved(false);
    setShared(false);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* ── LANDING ── */}
      {appState === 'LANDING' && (
        <div className="w-full max-w-md text-center space-y-8 fade-in">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">숨소리</h1>
            <p className="font-batang text-[var(--color-muted-foreground)] text-lg">
              말하지 못한 마음을 그림으로
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            1분만 말하면, 목소리가 그림이 됩니다.
            <br />
            말로 전하지 못한 마음을 그림으로 보내세요.
          </p>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-semibold text-lg transition-transform active:scale-95 shadow-lg"
            >
              녹음 시작하기
            </button>

            <button
              onClick={handleDemo}
              className="w-full py-3 rounded-2xl glass text-[var(--color-foreground)] text-sm transition-transform active:scale-95"
            >
              데모로 체험하기
            </button>
          </div>

          {/* Auth */}
          <div className="pt-4 space-y-3">
            {session?.user ? (
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-[var(--color-muted-foreground)]">
                  {session.user.name}님
                </span>
                <Link href="/my" className="text-[var(--color-accent-foreground)] font-medium">
                  내 숨소리
                </Link>
              </div>
            ) : (
              <button
                onClick={() => signIn('kakao')}
                className="w-full py-3 rounded-2xl bg-[#FEE500] text-[#191919] text-sm font-medium transition-transform active:scale-95"
              >
                카카오로 시작하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── RECORDING ── */}
      {appState === 'RECORDING' && (
        <div className="w-full max-w-md text-center space-y-8 fade-in">
          {/* Timer */}
          <div className="space-y-2">
            <p className="text-5xl font-mono font-light tabular-nums">
              {formatTime(recorder.elapsed)}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {recorder.elapsed >= 55 ? '곧 종료됩니다...' : '지금 느끼는 감정을 말해보세요'}
            </p>
          </div>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 h-20">
            {recorder.waveformData.map((v, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-[var(--color-accent)] transition-all duration-100"
                style={{ height: `${Math.max(4, v * 72)}px`, opacity: 0.5 + v * 0.5 }}
              />
            ))}
          </div>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="mx-auto w-20 h-20 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center recording-pulse shadow-lg transition-transform active:scale-90"
          >
            <div className="w-7 h-7 rounded-sm bg-white" />
          </button>

          <p className="text-xs text-[var(--color-muted-foreground)]">
            탭하여 녹음 중지
          </p>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {appState === 'ANALYZING' && (
        <div className="w-full max-w-md text-center space-y-8 fade-in">
          {/* Spinner */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)] spin-slow" />
          </div>

          <div className="space-y-2">
            <p className="font-batang text-lg">
              당신의 목소리를 듣고 있어요...
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              감정을 읽고 그림을 그리는 중입니다
            </p>
          </div>

          {/* Shimmer skeleton */}
          <div className="space-y-3">
            <div className="h-4 rounded-full shimmer w-3/4 mx-auto" />
            <div className="h-4 rounded-full shimmer w-1/2 mx-auto" />
            <div className="h-4 rounded-full shimmer w-2/3 mx-auto" />
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {appState === 'RESULT' && result && (
        <div className="w-full max-w-md space-y-6 fade-in">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src={result.image.url}
              alt={result.coreEmotion}
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* Core Emotion */}
          <div className="text-center">
            <span className="emotion-tag text-base">
              #{result.coreEmotion}
            </span>
          </div>

          {/* Summary — only for sender */}
          <p className="font-batang text-center text-lg leading-relaxed text-[var(--color-foreground)]">
            &ldquo;{result.summary}&rdquo;
          </p>

          {/* Concordance */}
          <div className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">목소리</span>
              <span className="font-medium">{result.voiceTone.emotion}</span>
              <span className="text-[var(--color-muted-foreground)]">|</span>
              <span className="text-[var(--color-muted-foreground)]">말의 뜻</span>
              <span className="font-medium">{result.textContent.emotion}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <span>일치도: {result.concordance.match === 'high' ? '높음' : result.concordance.match === 'medium' ? '보통' : '낮음'}</span>
              <span>— {result.concordance.explanation}</span>
            </div>
          </div>

          {/* Transcript */}
          {result.textContent.transcript && (
            <details className="glass rounded-xl p-4">
              <summary className="text-sm text-[var(--color-muted-foreground)] cursor-pointer">
                음성 텍스트 보기
              </summary>
              <p className="mt-2 text-sm leading-relaxed">
                {result.textContent.transcript}
              </p>
            </details>
          )}

          {/* Personal Message */}
          {result.cardId !== 'demo' && (
            <div className="space-y-2">
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="받는 사람에게 한마디 (선택)"
                className="w-full p-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-sm resize-none border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                rows={2}
                maxLength={200}
                disabled={messageSaved}
              />
              {personalMessage.trim() && !messageSaved && (
                <button
                  onClick={handleSaveMessage}
                  className="w-full py-2 rounded-xl bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] text-sm transition-transform active:scale-95"
                >
                  메시지 저장
                </button>
              )}
              {messageSaved && (
                <p className="text-xs text-center text-[var(--color-muted-foreground)]">저장됨</p>
              )}
            </div>
          )}

          {/* Share */}
          <div className="space-y-3 pt-2">
            {result.cardId !== 'demo' && (
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-semibold text-base transition-transform active:scale-95 shadow-lg"
              >
                {shared ? '공유 완료!' : '공유하기'}
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl glass text-[var(--color-foreground)] text-sm transition-transform active:scale-95"
            >
              다시 녹음하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
