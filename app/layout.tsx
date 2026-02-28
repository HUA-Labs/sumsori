import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HuaProvider } from "@hua-labs/hua/framework";
import { getSSRTranslations } from "@hua-labs/hua/framework/server";
import { ThemeToggle } from "@hua-labs/hua/ui";
import config from "../hua.config";
import { Providers } from "./providers";
import { SWRegister } from "./sw-register";

export const metadata: Metadata = {
  title: "숨소리 — 말하지 못한 마음을 그림으로",
  description: "1분만 말하면, 목소리가 그림이 됩니다. 말로 전하지 못한 마음을 그림으로 보내세요.",
  manifest: '/api/manifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '숨소리',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF6EA" },
    { media: "(prefers-color-scheme: dark)", color: "#232433" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTranslations = await getSSRTranslations(config);

  const configWithSSR = {
    ...config,
    i18n: config.i18n ? { ...config.i18n, initialTranslations } : undefined,
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <HuaProvider config={configWithSSR}>
          <Providers>
            <SWRegister />
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle variant="icon" />
            </div>
            {children}
          </Providers>
        </HuaProvider>
      </body>
    </html>
  );
}
