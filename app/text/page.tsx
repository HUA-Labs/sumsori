'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { MagnifyingGlass, Heart, PaintBrush, Sparkle } from '@phosphor-icons/react';
import type { TextAnalyzeResponse } from '@/lib/types';

type AppState = 'TEXT_INPUT' | 'ANALYZING' | 'RESULT';

const VOICE_OPTIONS = [
  { key: 'female-warm', labelKey: 'common:textMode.voiceFemaleWarm' },
  { key: 'female-firm', labelKey: 'common:textMode.voiceFemaleFirm' },
  { key: 'male-upbeat', labelKey: 'common:textMode.voiceMaleUpbeat' },
  { key: 'male-calm', labelKey: 'common:textMode.voiceMaleCalm' },
] as const;

const MAX_CHARS = 500;

export default function TextPage() {
  const { t, currentLanguage } = useTranslation();

  const [appState, setAppState] = useState<AppState>('TEXT_INPUT');
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('female-warm');
  const [result, setResult] = useState<TextAnalyzeResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [messageSaved, setMessageSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    setAppState('ANALYZING');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('locale', currentLanguage);
      formData.append('voice', voice);
      const res = await fetch('/api/text-analyze', { method: 'POST', body: formData });
      const json: TextAnalyzeResponse = await res.json();
      if (json.data) {
        setResult(json.data);
        setAppState('RESULT');
      } else {
        setError(json.error ?? t('common:error.analysisFailed'));
        setAppState('TEXT_INPUT');
      }
    } catch {
      setError(t('common:error.serverError'));
      setAppState('TEXT_INPUT');
    }
  }, [text, voice, currentLanguage, t]);

  const handleDemo = useCallback(async () => {
    setAppState('ANALYZING');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('demo', 'true');
      formData.append('locale', currentLanguage);
      const res = await fetch('/api/text-analyze', { method: 'POST', body: formData });
      const json: TextAnalyzeResponse = await res.json();
      if (json.data) {
        setResult(json.data);
        setAppState('RESULT');
      }
    } catch {
      setError(t('common:error.demoFailed'));
      setAppState('TEXT_INPUT');
    }
  }, [currentLanguage, t]);

  const handleSaveMessage = useCallback(async () => {
    if (!result?.cardId || result.cardId === 'demo') return;
    try {
      await fetch('/api/card/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: result.cardId,
          message: personalMessage.trim() || undefined,
        }),
      });
      setMessageSaved(true);
    } catch { /* ignore */ }
  }, [result, personalMessage]);

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
  }, [result, personalMessage, messageSaved]);

  const handleReset = useCallback(() => {
    setAppState('TEXT_INPUT');
    setText('');
    setResult(null);
    setError(null);
    setPersonalMessage('');
    setMessageSaved(false);
    setShared(false);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100dvh-theme(spacing.14)-theme(spacing.20))]">
      {/* ── TEXT INPUT ── */}
      {appState === 'TEXT_INPUT' && (
        <div className="w-full max-w-md md:max-w-lg text-center space-y-6 fade-in">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('common:textMode.title')}</h1>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder={t('common:textMode.placeholder')}
              className="w-full p-5 rounded-2xl bg-[var(--color-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-lg resize-none border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-h-[180px]"
              rows={5}
              maxLength={MAX_CHARS}
            />
            <span className="absolute bottom-4 right-4 text-sm text-[var(--color-muted-foreground)]">
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          {/* Voice Select */}
          <div className="space-y-2">
            <label className="text-base text-[var(--color-muted-foreground)]">
              {t('common:textMode.voiceSelect')}
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full p-4 rounded-xl bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base"
            >
              {VOICE_OPTIONS.map(({ key, labelKey }) => (
                <option key={key} value={key}>
                  {t(labelKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="w-full py-5 rounded-2xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-semibold text-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {t('common:textMode.analyze')}
            </button>

            <button
              onClick={handleDemo}
              className="w-full py-4 rounded-2xl glass text-[var(--color-foreground)] text-base transition-transform active:scale-95"
            >
              {t('common:landing.tryDemo')}
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {appState === 'ANALYZING' && <AnalyzingOverlay t={t} />}

      {/* ── RESULT ── */}
      {appState === 'RESULT' && result && (
        <div className="w-full max-w-md md:max-w-lg fade-in">
          <div className="glass rounded-2xl overflow-hidden">
            {/* Image */}
            <img
              src={result.image.url}
              alt={result.coreEmotion}
              className="aspect-square w-full object-cover"
            />

            <div className="p-6 space-y-5">
              {/* Core Emotion */}
              <div className="text-center">
                <span className="emotion-tag text-lg">
                  #{result.coreEmotion}
                </span>
              </div>

              {/* Summary */}
              <p className="font-batang text-center text-xl md:text-2xl leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{result.summary}&rdquo;
              </p>

              {/* Audio Player */}
              {result.audio.url && (
                <div className="rounded-xl p-4 bg-[var(--color-muted)]/50 space-y-3">
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {t('common:textMode.playVoice')}
                  </p>
                  <audio
                    ref={audioRef}
                    src={result.audio.url}
                    controls
                    className="w-full h-10"
                  />
                </div>
              )}

              {/* Personal Message */}
              {result.cardId !== 'demo' && (
                <div className="space-y-3">
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder={t('common:result.messagePlaceholder')}
                    className="w-full p-4 rounded-xl bg-[var(--color-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-base resize-none border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    rows={2}
                    maxLength={200}
                    disabled={messageSaved}
                  />
                  {personalMessage.trim() && !messageSaved && (
                    <button
                      onClick={handleSaveMessage}
                      className="w-full py-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] text-base transition-transform active:scale-95"
                    >
                      {t('common:result.saveMessage')}
                    </button>
                  )}
                  {messageSaved && (
                    <p className="text-sm text-center text-[var(--color-muted-foreground)]">{t('common:result.saved')}</p>
                  )}
                </div>
              )}

              {/* Share + Reset */}
              <div className="space-y-3 pt-1">
                {result.cardId !== 'demo' && (
                  <button
                    onClick={handleShare}
                    className="w-full py-5 rounded-2xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-semibold text-lg transition-transform active:scale-95"
                  >
                    {shared ? t('common:result.shared') : t('common:result.share')}
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-2xl text-[var(--color-muted-foreground)] text-base transition-transform active:scale-95"
                >
                  {t('common:textMode.writeAgain')}
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

const STEP_INTERVALS = [0, 4000, 10000, 18000];

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
    'common:textMode.analyzingStep1',
    'common:textMode.analyzingStep2',
    'common:textMode.analyzingStep3',
    'common:textMode.analyzingStep4',
  ];

  const icons = [
    <MagnifyingGlass key="search" size={48} weight="duotone" className="text-[var(--color-accent)]" />,
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
          <div className="aspect-[4/3] rounded-2xl shimmer mx-auto" />
          <div className="h-5 rounded-full shimmer w-1/3 mx-auto" />
          <div className="h-4 rounded-full shimmer w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
