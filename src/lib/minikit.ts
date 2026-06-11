declare global {
  interface Window {
    MiniKit?: unknown;
  }
}

export function hasMiniKit() {
  return typeof window !== "undefined" && Boolean(window.MiniKit);
}
