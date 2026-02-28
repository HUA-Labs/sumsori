'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@hua-labs/hua/i18n';
import LoginModal from '@/components/LoginModal';

interface CardItem {
  id: string;
  image_url: string;
  core_emotion: string;
  created_at: string;
}

export default function MyPage() {
  const { t, currentLanguage } = useTranslation();
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/cards')
      .then((res) => res.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoginOpen(true);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin-slow" />
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="flex flex-col items-center justify-center px-4 py-20 gap-4">
        <p className="text-[var(--color-muted-foreground)]">{t('common:my.loginRequired')}</p>
        <button
          onClick={() => setLoginOpen(true)}
          className="py-3 px-6 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium transition-transform active:scale-95"
        >
          {t('common:my.login')}
        </button>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </main>
    );
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold">{t('common:my.title')}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {t('common:my.subtitle', { name: session?.user?.name ?? '' })}
          </p>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-3xl shimmer" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-[var(--color-muted-foreground)]">
              {t('common:my.empty')}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="py-3 px-6 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium transition-transform active:scale-95"
              >
                {t('common:my.firstRecording')}
              </Link>
              <Link
                href="/text"
                className="py-3 px-6 rounded-full glass text-[var(--color-foreground)] text-sm font-medium transition-transform active:scale-95"
              >
                {t('common:my.firstText')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/card/${card.id}`}
                className="group relative overflow-hidden rounded-3xl transition-transform active:scale-95"
              >
                <img
                  src={card.image_url}
                  alt={card.core_emotion}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <span className="text-white text-xs font-medium">
                    #{card.core_emotion}
                  </span>
                  <p className="text-white/60 text-[10px]">
                    {new Date(card.created_at).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
