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
    <html lang="en">
      <body className={inter.className}>
        <RootTemplate>
          {children}
        </RootTemplate>
      </body>
    </html>
  );
}
