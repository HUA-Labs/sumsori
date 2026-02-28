'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microphone, Images } from '@phosphor-icons/react';

const tabs = [
  { href: '/', label: '녹음', icon: Microphone },
  { href: '/my', label: '내 숨소리', icon: Images },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  // /card/[id] 공유 페이지에서는 숨기기
  if (pathname.startsWith('/card/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass border-t border-[var(--color-border)]/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                active
                  ? 'text-[var(--color-accent-foreground)] font-semibold'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              <Icon size={24} weight={active ? 'fill' : 'regular'} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
