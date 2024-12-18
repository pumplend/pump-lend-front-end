'use client';
import type { AppProps } from "next/app";

import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import('@/styles/styles.css' as any) ;
// import('@/styles/styles.css' as any) ;
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

const endpoint = 'https://api.devnet.solana.com';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const wallets = useMemo(
    () => [
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
      <NextUIProvider navigate={router.push}>
          <NextThemesProvider>
            <Component {...pageProps} />
          </NextThemesProvider>
        </NextUIProvider>
      </WalletModalProvider>
    </WalletProvider>
    </ConnectionProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
