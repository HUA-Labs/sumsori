'use client';

import { signIn } from 'next-auth/react';
import { useTranslation } from '@hua-labs/hua/i18n';
import { Modal } from '@hua-labs/ui/overlay';
import { Cat } from '@phosphor-icons/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closable>
      <div className="flex flex-col items-center gap-8 px-4 py-6">
        {/* Cute icon */}
        <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
          <Cat size={36} weight="duotone" className="text-[var(--color-accent)]" />
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold">{t('common:app.name')}</p>
          <p className="text-base text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
            {t('common:auth.loginDescription')}
          </p>
        </div>

        {/* Kakao Login */}
        <button
          onClick={() => signIn('kakao')}
          className="w-full py-4 rounded-2xl bg-[#FEE500] text-[#191919] text-lg font-semibold transition-transform active:scale-95"
        >
          {t('common:auth.loginWithKakao')}
        </button>
      </div>
    </Modal>
  );
}
