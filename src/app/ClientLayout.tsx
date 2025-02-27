'use client';
import { RootTemplate } from "@/components/RootTemplate";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <RootTemplate>
      {children}
    </RootTemplate>
  );
} 