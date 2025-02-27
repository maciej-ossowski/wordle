import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootTemplate } from "@/components/RootTemplate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordle - Carry1st Games",
  description: "Challenge your word-guessing skills with Wordle!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.getItem('darkMode') === 'true' ||
                  (!('darkMode' in localStorage) &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          `
        }} />
        <style>{`
          :root {
            --initial-bg: #3498db;
          }
          .dark {
            --initial-bg: #313233;
          }
          html, body {
            background-color: var(--initial-bg);
          }
        `}</style>
      </head>
      <body className={`${inter.className} bg-[#3498db] dark:bg-[#313233] transition-none`}>
        <RootTemplate>{children}</RootTemplate>
      </body>
    </html>
  );
}
