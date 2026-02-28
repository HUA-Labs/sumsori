'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { ThemeToggle } from '@hua-labs/hua/ui';
import { Avatar } from '@hua-labs/ui';
import { User } from '@phosphor-icons/react';
import { LanguageToggle } from './LanguageToggle';
import LoginSheet from './LoginSheet';

export default function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-14 glass flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <span className="text-lg font-bold tracking-tight">{t('common:app.name')}</span>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle variant="icon" />
          <button
            onClick={() => setSheetOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-muted)]"
            aria-label={t('common:nav.profile')}
          >
            {session?.user ? (
              <Avatar
                src={session.user.image ?? undefined}
                alt={session.user.name ?? ''}
                size="sm"
              />
            ) : (
              <User size={20} weight="bold" />
            )}
          </button>
        </div>
      </header>

      <LoginSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
