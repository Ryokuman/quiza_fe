"use client";

import { MiniKitProvider } from "@worldcoin/minikit-js/provider";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      props={{ appId: process.env.NEXT_PUBLIC_APP_ID }}
    >
      {children}
    </MiniKitProvider>
  );
}
