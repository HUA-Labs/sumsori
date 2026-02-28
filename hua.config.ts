import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  motion: {
    style: 'smooth',
    enableAnimations: true,
  },
  state: {
    persist: true,
    ssr: true,
  },
  branding: {
    name: 'Sumsori',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
    },
  },
});
