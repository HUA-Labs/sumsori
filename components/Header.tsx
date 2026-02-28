'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { ThemeToggle } from '@hua-labs/hua/ui';
import { Avatar } from '@hua-labs/ui';
import { Popover } from '@hua-labs/ui/overlay';
import { User, SignOut } from '@phosphor-icons/react';
import { LanguageToggle } from './LanguageToggle';
import LoginModal from './LoginModal';

export default function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-14 glass flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <span className="text-lg font-bold tracking-tight">{t('common:app.name')}</span>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle variant="icon" />

          {session?.user ? (
            /* ── Logged in: Profile Popover ── */
            <Popover
              position="bottom"
              align="end"
              trigger={
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-muted)]"
                  aria-label={t('common:nav.profile')}
                >
                  <Avatar
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? ''}
                    size="sm"
                  />
                </button>
              }
            >
              <div className="w-64">
                {/* User info */}
                <div className="flex flex-col items-center gap-3 px-5 py-5 border-b border-[var(--color-border)]">
                  <Avatar
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? ''}
                    size="lg"
                  />
                  <div className="text-center">
                    <p className="text-lg font-semibold">{session.user.name}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Kakao</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3">
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-base text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)]"
                  >
                    <SignOut size={20} />
                    {t('common:auth.logout')}
                  </button>
                </div>
              </div>
            </Popover>
          ) : (
            /* ── Logged out: Login button → Modal ── */
            <button
              onClick={() => setLoginOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-muted)]"
              aria-label={t('common:nav.profile')}
            >
              <User size={20} weight="bold" />
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
