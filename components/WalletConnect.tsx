"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateWalletAddress } from "@/app/actions/auth";
import { connectWallet } from "@/lib/minikit";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      await updateWalletAddress(addr);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={connect} disabled={loading}>{loading ? "Connecting..." : address ? "Re-connect" : "Connect Wallet"}</Button>
      {address && <span className="text-xs text-muted-foreground">{address.slice(0, 6)}…{address.slice(-4)}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
