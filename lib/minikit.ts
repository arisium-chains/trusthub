// World App MiniKit integration wrapper (phase one)
// Attempts to dynamically import the SDK if available, otherwise falls back to global window.MiniKit.

export async function connectWallet(): Promise<string> {
  // Try dynamic import first
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import(/* @vite-ignore */ '@worldcoin/minikit');
    const MiniKit = (mod as any).MiniKit || (mod as any).default || (mod as any);
    const projectId = process.env.NEXT_PUBLIC_MINIKIT_ID;
    if (MiniKit?.init && projectId) {
      await MiniKit.init({ projectId });
    }
    if (MiniKit?.walletAuth) {
      const res = await MiniKit.walletAuth();
      const addr = res?.address || res?.walletAddress;
      if (!addr) throw new Error('MiniKit did not return address');
      return String(addr);
    }
  } catch (e) {
    // ignore and try window fallback
  }

  if (typeof window !== 'undefined' && (window as any).MiniKit?.walletAuth) {
    const res = await (window as any).MiniKit.walletAuth();
    const addr = res?.address || res?.walletAddress;
    if (!addr) throw new Error('MiniKit (window) did not return address');
    return String(addr);
  }

  throw new Error('World App MiniKit not installed or unavailable. Install @worldcoin/minikit and set NEXT_PUBLIC_MINIKIT_ID.');
}

