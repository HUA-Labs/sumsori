'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CardItem {
  id: string;
  image_url: string;
  core_emotion: string;
  created_at: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/cards')
      .then((res) => res.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading') {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin-slow" />
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-[var(--color-muted-foreground)]">로그인이 필요합니다</p>
        <Link
          href="/"
          className="py-3 px-6 rounded-2xl bg-[var(--color-accent)] text-white text-sm font-medium"
        >
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">내 숨소리</h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {session?.user?.name}님의 감정 기록
            </p>
          </div>
          <Link
            href="/"
            className="py-2 px-4 rounded-xl glass text-sm text-[var(--color-foreground)]"
          >
            녹음하기
          </Link>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl shimmer" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🎙️</p>
            <p className="text-[var(--color-muted-foreground)]">
              아직 숨소리가 없어요
            </p>
            <Link
              href="/"
              className="inline-block py-3 px-6 rounded-2xl bg-[var(--color-accent)] text-white text-sm font-medium"
            >
              첫 녹음 시작하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/card/${card.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-md transition-transform active:scale-95"
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
                    {new Date(card.created_at).toLocaleDateString('ko-KR', {
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
