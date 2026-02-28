'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@hua-labs/hua/i18n';
import { Microphone, TextAa, Images } from '@phosphor-icons/react';

const tabs = [
  { href: '/', labelKey: 'common:nav.record', icon: Microphone },
  { href: '/text', labelKey: 'common:nav.text', icon: TextAa },
  { href: '/my', labelKey: 'common:nav.myCards', icon: Images },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname.startsWith('/card/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-nav)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16">
        {tabs.map(({ href, labelKey, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-sm transition-colors ${
                active
                  ? 'text-[var(--color-nav-foreground)] font-semibold'
                  : 'text-[var(--color-nav-foreground)]/60'
              }`}
            >
              <Icon size={26} weight={active ? 'fill' : 'regular'} />
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
