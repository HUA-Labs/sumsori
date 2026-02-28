import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { SharedCard } from '@/lib/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCard(id: string): Promise<SharedCard | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, image_url, core_emotion, personal_message, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as SharedCard;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return { title: '숨소리' };
  }

  const title = `#${card.core_emotion} — 숨소리`;
  const description = card.personal_message || '목소리가 그림이 되었어요.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: card.image_url, width: 1024, height: 1024 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [card.image_url],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    notFound();
  }

  const date = new Date(card.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={card.image_url}
            alt={card.core_emotion}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Core Emotion */}
        <div className="text-center">
          <span className="emotion-tag">
            #{card.core_emotion}
          </span>
        </div>

        {/* Personal Message */}
        {card.personal_message && (
          <p className="font-batang text-center text-lg leading-relaxed text-[var(--color-foreground)] opacity-90">
            &ldquo;{card.personal_message}&rdquo;
          </p>
        )}

        {/* Date */}
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">{date}</p>

        {/* Footer */}
        <div className="pt-4 text-center">
          <p className="text-xs text-[var(--color-muted-foreground)] opacity-50">
            숨소리 — 말하지 못한 마음을 그림으로
          </p>
        </div>
      </div>
    </main>
  );
}
