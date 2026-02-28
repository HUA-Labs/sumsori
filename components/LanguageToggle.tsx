'use client';

import { useTranslation, useLanguageChange } from '@hua-labs/hua/i18n';
import { Globe } from '@phosphor-icons/react';

export function LanguageToggle() {
  const { currentLanguage } = useTranslation();
  const { changeLanguage, supportedLanguages } = useLanguageChange();

  const handleToggle = () => {
    const codes = supportedLanguages.map(lang => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % codes.length;
    changeLanguage(codes[nextIndex]);
  };

  const shortLabels: Record<string, string> = {
    ko: 'KO',
    en: 'EN',
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1 h-9 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--color-muted)]"
      aria-label="Toggle language"
    >
      <Globe size={16} weight="duotone" />
      <span>{shortLabels[currentLanguage] || currentLanguage.toUpperCase()}</span>
    </button>
  );
}
