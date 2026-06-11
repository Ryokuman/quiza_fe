"use client";

import { MiniKitProvider } from "@worldcoin/minikit-js/provider";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_APP_ID;

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <MiniKitProvider
      props={{ appId }}
    >
      {children}
    </MiniKitProvider>
  );
}
