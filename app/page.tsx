'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { AnalyzeResponse } from '@/lib/types';

const ACCEPTED_AUDIO_TYPES = 'audio/webm,audio/mp4,audio/m4a,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,.webm,.m4a,.mp3,.wav,.ogg,.aac,.mp4';

type AppState = 'LANDING' | 'RECORDING' | 'ANALYZING' | 'RESULT';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError(t('common:error.micPermission'));
    }
  }, [recorder]);

  const handleStop = useCallback(() => {
    recorder.stop();
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
  }, []);

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

    // Save message + transcript preference before sharing
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
        <div className="w-full max-w-md text-center space-y-8 fade-in">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('common:app.name')}</h1>
            <p className="font-batang text-[var(--color-muted-foreground)] text-lg">
              {t('common:app.tagline')}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
            {t('common:app.description')}
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
              {t('common:landing.startRecording')}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-2xl glass text-[var(--color-foreground)] text-sm transition-transform active:scale-95"
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
              className="w-full py-3 rounded-2xl glass text-[var(--color-foreground)] text-sm transition-transform active:scale-95"
            >
              {t('common:landing.tryDemo')}
            </button>
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
              {recorder.elapsed >= 55 ? t('common:recording.ending') : t('common:recording.prompt')}
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
            {t('common:recording.tapToStop')}
          </p>
        </div>
      )}

      {/* ── ANALYZING — Full-screen loading overlay ── */}
      {appState === 'ANALYZING' && <AnalyzingOverlay t={t} />}

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
              <span className="text-[var(--color-muted-foreground)]">{t('common:result.voiceTone')}</span>
              <span className="font-medium">{result.voiceTone.emotion}</span>
              <span className="text-[var(--color-muted-foreground)]">|</span>
              <span className="text-[var(--color-muted-foreground)]">{t('common:result.textMeaning')}</span>
              <span className="font-medium">{result.textContent.emotion}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <span>{t('common:result.concordance')}: {result.concordance.match === 'high' ? t('common:result.concordanceHigh') : result.concordance.match === 'medium' ? t('common:result.concordanceMedium') : t('common:result.concordanceLow')}</span>
              <span>— {result.concordance.explanation}</span>
            </div>
          </div>

          {/* Transcript */}
          {result.textContent.transcript && (
            <details className="glass rounded-xl p-4">
              <summary className="text-sm text-[var(--color-muted-foreground)] cursor-pointer">
                {t('common:result.showTranscript')}
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
                placeholder={t('common:result.messagePlaceholder')}
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
                  {t('common:result.saveMessage')}
                </button>
              )}
              {messageSaved && (
                <p className="text-xs text-center text-[var(--color-muted-foreground)]">{t('common:result.saved')}</p>
              )}
            </div>
          )}

          {/* Include transcript toggle */}
          {result.cardId !== 'demo' && result.textContent.transcript && (
            <label className="flex items-center gap-3 glass rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-accent)]"
                disabled={messageSaved}
              />
              <span className="text-sm text-[var(--color-foreground)]">
                {t('common:result.includeTranscript')}
              </span>
            </label>
          )}

          {/* Share */}
          <div className="space-y-3 pt-2">
            {result.cardId !== 'demo' && (
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-semibold text-base transition-transform active:scale-95 shadow-lg"
              >
                {shared ? t('common:result.shared') : t('common:result.share')}
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl glass text-[var(--color-foreground)] text-sm transition-transform active:scale-95"
            >
              {t('common:result.recordAgain')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Analyzing Overlay ── */

const STEP_INTERVALS = [0, 5000, 12000, 20000]; // ms thresholds for each step

function AnalyzingOverlay({ t }: { t: (key: string) => string }) {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');

  // Progress through steps based on elapsed time
  useEffect(() => {
    const timers = STEP_INTERVALS.slice(1).map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animated dots
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

  const emojis = ['👂', '💭', '🎨', '✨'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-background)]/95 backdrop-blur-sm px-6">
      <div className="w-full max-w-xs text-center space-y-8 fade-in">
        {/* Breathing emoji */}
        <div className="breathe text-5xl" key={step}>
          {emojis[step]}
        </div>

        {/* Step message */}
        <div className="space-y-2">
          <p className="font-batang text-xl float-up" key={`msg-${step}`}>
            {t(stepKeys[step])}{dots}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {t('common:analyzing.processing')}
          </p>
        </div>

        {/* Step dots indicator */}
        <div className="flex items-center justify-center gap-2">
          {stepKeys.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i <= step
                  ? 'w-2.5 h-2.5 bg-[var(--color-accent)]'
                  : 'w-2 h-2 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        {/* Shimmer skeleton — looks like incoming result */}
        <div className="space-y-3 pt-4">
          <div className="aspect-[4/3] rounded-2xl shimmer mx-auto" />
          <div className="h-4 rounded-full shimmer w-1/3 mx-auto" />
          <div className="h-3 rounded-full shimmer w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
