'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { Ear, Heart, PaintBrush, Sparkle, Play, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { AnalyzeResponse } from '@/lib/types';

const ACCEPTED_AUDIO_TYPES = 'audio/webm,audio/mp4,audio/m4a,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,.webm,.m4a,.mp3,.wav,.ogg,.aac,.mp4';

type AppState = 'LANDING' | 'RECORDING' | 'PREVIEW' | 'ANALYZING' | 'RESULT';

const MIN_DURATION = 2;
const MAX_DURATION = 30;

export default function HomePage() {
  const { t, currentLanguage } = useTranslation();
  const recorder = useAudioRecorder();

  const [appState, setAppState] = useState<AppState>('LANDING');
  const [result, setResult] = useState<AnalyzeResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [messageSaved, setMessageSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [includeTranscript, setIncludeTranscript] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Move to PREVIEW when recording stops (instead of auto-submit)
  useEffect(() => {
    if (recorder.state === 'stopped' && recorder.audioBlob && appState === 'RECORDING') {
      setRecordedDuration(recorder.elapsed);
      // Clean up previous preview URL
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(recorder.audioBlob);
      setAppState('PREVIEW');
    }
  }, [recorder.state]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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
      setError(t('common:error.micPermission'));
    }
  }, [recorder]);

  const handleStop = useCallback(() => {
    if (recorder.elapsed < MIN_DURATION) return;
    recorder.stop();
  }, [recorder]);

  const handlePreviewSubmit = useCallback(() => {
    if (recorder.audioBlob) {
      handleSubmit(recorder.audioBlob);
    }
  }, [recorder.audioBlob]);

  const handleReRecord = useCallback(async () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setError(null);
    try {
      await recorder.start();
      setAppState('RECORDING');
    } catch {
      setError(t('common:error.micPermission'));
      setAppState('LANDING');
    }
  }, [recorder]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError(t('common:error.fileTooLarge'));
      return;
    }
    handleSubmit(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [t]);

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
      setError(t('common:error.demoFailed'));
      setAppState('LANDING');
    }
  }, []);

  const handleSubmit = useCallback(async (blob: Blob) => {
    setAppState('ANALYZING');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('locale', currentLanguage);
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const json: AnalyzeResponse = await res.json();
      if (json.data) {
        setResult(json.data);
        setAppState('RESULT');
      } else {
        setError(json.error ?? t('common:error.analysisFailed'));
        setAppState('LANDING');
      }
    } catch {
      setError(t('common:error.serverError'));
      setAppState('LANDING');
    }
  }, []);

  const handleSaveMessage = useCallback(async () => {
    if (!result?.cardId || result.cardId === 'demo') return;
    try {
      await fetch('/api/card/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: result.cardId,
          message: personalMessage.trim() || undefined,
          showTranscript: includeTranscript,
        }),
      });
      setMessageSaved(true);
    } catch { /* ignore */ }
  }, [result, personalMessage, includeTranscript]);

  const handleShare = useCallback(async () => {
    if (!result?.cardId || result.cardId === 'demo') return;

    if (!messageSaved) {
      try {
        await fetch('/api/card/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: result.cardId,
            message: personalMessage.trim() || undefined,
            showTranscript: includeTranscript,
          }),
        });
        setMessageSaved(true);
      } catch { /* ignore */ }
    }

    const url = `${window.location.origin}/card/${result.cardId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `#${result.coreEmotion} — ${t('common:app.name')}`,
          text: t('common:result.shareText'),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
    } catch { /* cancelled */ }
  }, [result, personalMessage, includeTranscript, messageSaved]);

  const handleReset = useCallback(() => {
    setAppState('LANDING');
    setResult(null);
    setError(null);
    setPersonalMessage('');
    setMessageSaved(false);
    setShared(false);
    setIncludeTranscript(false);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100dvh-theme(spacing.14)-theme(spacing.20))]">
      {/* ── LANDING ── */}
      {appState === 'LANDING' && (
        <div className="w-full max-w-md md:max-w-lg text-center space-y-8 fade-in">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">{t('common:app.name')}</h1>
            <p className="font-batang text-[var(--color-muted-foreground)] text-xl md:text-2xl">
              {t('common:app.tagline')}
            </p>
          </div>

          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
            {t('common:app.description')}
          </p>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-semibold text-xl transition-transform active:scale-95"
            >
              {t('common:landing.startRecording')}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-full glass text-[var(--color-foreground)] text-base transition-transform active:scale-95"
            >
              {t('common:landing.uploadFile')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AUDIO_TYPES}
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={handleDemo}
              className="w-full py-4 rounded-full glass text-[var(--color-foreground)] text-base transition-transform active:scale-95"
            >
              {t('common:landing.tryDemo')}
            </button>
          </div>
        </div>
      )}

      {/* ── RECORDING ── */}
      {appState === 'RECORDING' && (
        <div className="w-full max-w-md md:max-w-lg text-center space-y-8 fade-in">
          <div className="space-y-2">
            <p className="text-6xl md:text-7xl font-mono font-light tabular-nums">
              {formatTime(recorder.elapsed)}
            </p>
            <p className="text-base md:text-lg text-[var(--color-muted-foreground)]">
              {recorder.elapsed < MIN_DURATION
                ? t('common:recording.minTime', { sec: MIN_DURATION })
                : recorder.elapsed >= MAX_DURATION - 5
                  ? t('common:recording.ending')
                  : t('common:recording.prompt')}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]/60">
              {t('common:recording.duration', { min: MIN_DURATION, max: MAX_DURATION })}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 h-20">
            {recorder.waveformData.map((v, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-[var(--color-accent)] transition-all duration-100"
                style={{ height: `${Math.max(4, v * 72)}px`, opacity: 0.5 + v * 0.5 }}
              />
            ))}
          </div>

          <button
            onClick={handleStop}
            disabled={recorder.elapsed < MIN_DURATION}
            className="mx-auto w-20 h-20 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] flex items-center justify-center recording-pulse transition-transform active:scale-90 disabled:opacity-40 disabled:recording-pulse-none"
          >
            <div className="w-7 h-7 rounded-sm bg-white" />
          </button>

          <p className="text-xs text-[var(--color-muted-foreground)]">
            {recorder.elapsed < MIN_DURATION
              ? t('common:recording.waitMin')
              : t('common:recording.tapToStop')}
          </p>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {appState === 'PREVIEW' && previewUrlRef.current && (
        <div className="w-full max-w-md md:max-w-lg text-center space-y-8 fade-in">
          <div className="space-y-2">
            <p className="text-2xl md:text-3xl font-bold">
              {t('common:preview.title')}
            </p>
            <p className="text-base text-[var(--color-muted-foreground)]">
              {t('common:preview.duration', { sec: recordedDuration })}
            </p>
          </div>

          <audio
            ref={previewAudioRef}
            src={previewUrlRef.current}
            controls
            className="w-full h-12 mx-auto"
          />

          <div className="space-y-3">
            <button
              onClick={handlePreviewSubmit}
              className="w-full py-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-semibold text-xl transition-transform active:scale-95"
            >
              {t('common:preview.submit')}
            </button>

            <button
              onClick={handleReRecord}
              className="w-full py-4 rounded-full glass text-[var(--color-foreground)] text-base transition-transform active:scale-95"
            >
              {t('common:preview.reRecord')}
            </button>

            <button
              onClick={handleReset}
              className="w-full py-4 rounded-full text-[var(--color-muted-foreground)] text-base transition-transform active:scale-95"
            >
              {t('common:preview.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {appState === 'ANALYZING' && <AnalyzingOverlay t={t} />}

      {/* ── RESULT ── */}
      {appState === 'RESULT' && result && (
        <div className="w-full max-w-md md:max-w-lg fade-in">
          <div className="glass rounded-3xl overflow-hidden">
            <img
              src={result.image.url}
              alt={result.coreEmotion}
              className="aspect-square w-full object-cover"
            />

            <div className="p-6 space-y-5">
              <div className="text-center">
                <span className="emotion-tag text-lg">
                  #{result.coreEmotion}
                </span>
              </div>

              <p className="font-batang text-center text-xl md:text-2xl leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{result.summary}&rdquo;
              </p>

              {result.cardId !== 'demo' && (
                <div className="space-y-3">
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder={t('common:result.messagePlaceholder')}
                    className="w-full p-4 rounded-3xl bg-[var(--color-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-base resize-none border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    rows={2}
                    maxLength={200}
                    disabled={messageSaved}
                  />
                  {personalMessage.trim() && !messageSaved && (
                    <button
                      onClick={handleSaveMessage}
                      className="w-full py-3 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] text-base transition-transform active:scale-95"
                    >
                      {t('common:result.saveMessage')}
                    </button>
                  )}
                  {messageSaved && (
                    <p className="text-sm text-center text-[var(--color-muted-foreground)]">{t('common:result.saved')}</p>
                  )}
                </div>
              )}

              {result.cardId !== 'demo' && result.textContent.transcript && (
                <label className="flex items-center gap-3 rounded-3xl p-4 bg-[var(--color-muted)]/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTranscript}
                    onChange={(e) => setIncludeTranscript(e.target.checked)}
                    className="w-5 h-5 rounded accent-[var(--color-accent)]"
                    disabled={messageSaved}
                  />
                  <span className="text-base text-[var(--color-foreground)]">
                    {t('common:result.includeTranscript')}
                  </span>
                </label>
              )}

              <div className="space-y-3 pt-1">
                {result.cardId !== 'demo' && (
                  <button
                    onClick={handleShare}
                    className="w-full py-5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-semibold text-lg transition-transform active:scale-95"
                  >
                    {shared ? t('common:result.shared') : t('common:result.share')}
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-full text-[var(--color-muted-foreground)] text-base transition-transform active:scale-95"
                >
                  {t('common:result.recordAgain')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Analyzing Overlay ── */

const STEP_INTERVALS = [0, 5000, 12000, 20000];

function AnalyzingOverlay({ t }: { t: (key: string) => string }) {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timers = STEP_INTERVALS.slice(1).map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const stepKeys = [
    'common:analyzing.step1',
    'common:analyzing.step2',
    'common:analyzing.step3',
    'common:analyzing.step4',
  ];

  const icons = [
    <Ear key="ear" size={48} weight="duotone" className="text-[var(--color-accent)]" />,
    <Heart key="heart" size={48} weight="duotone" className="text-[var(--color-accent)]" />,
    <PaintBrush key="brush" size={48} weight="duotone" className="text-[var(--color-accent)]" />,
    <Sparkle key="sparkle" size={48} weight="duotone" className="text-[var(--color-accent)]" />,
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-background)]/95 backdrop-blur-sm px-6">
      <div className="w-full max-w-xs md:max-w-sm text-center space-y-8 fade-in">
        <div className="breathe flex justify-center" key={step}>
          {icons[step]}
        </div>

        <div className="space-y-3">
          <p className="font-batang text-2xl md:text-3xl float-up" key={`msg-${step}`}>
            {t(stepKeys[step])}{dots}
          </p>
          <p className="text-base text-[var(--color-muted-foreground)]">
            {t('common:analyzing.processing')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {stepKeys.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i <= step
                  ? 'w-3 h-3 bg-[var(--color-accent)]'
                  : 'w-2.5 h-2.5 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        <div className="space-y-4 pt-4">
          <div className="aspect-[4/3] rounded-3xl shimmer mx-auto" />
          <div className="h-5 rounded-full shimmer w-1/3 mx-auto" />
          <div className="h-4 rounded-full shimmer w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
