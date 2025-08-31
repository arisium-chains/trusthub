"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitReviewAction } from "@/app/actions/reviews";
import { connectWallet, getUserVerificationStatus, type WalletAuthResult } from "@/lib/minikit";
import { VerifiedBadge, type VerificationLevel } from "@/components/ui/verified-badge";
import { useNotifications } from "@/hooks/use-notifications";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

function NewReviewInner() {
  const params = useSearchParams();
  const appFromQuery = params.get("app") || "";
  const [step, setStep] = useState<Step>(1);
  const [app, setApp] = useState(appFromQuery);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [proof, setProof] = useState("");
  const [walletData, setWalletData] = useState<WalletAuthResult | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>('none');
  const [isConnecting, setIsConnecting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const progress = useMemo(() => (step / 6) * 100, [step]);

  const handleConnectWallet = async (requireSignature = false) => {
    setIsConnecting(true);
    try {
      const result = await connectWallet(requireSignature);
      setWalletData(result);
      
      const status = await getUserVerificationStatus();
      setVerificationLevel(status.verificationLevel);
      
      showSuccess(`Wallet connected: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`);
    } catch (error) {
      showError(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  function next() {
    setStep((s) => (s < 6 ? ((s + 1) as Step) : s));
  }
  function back() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4" aria-live="polite">
      <div className="text-xs text-muted-foreground">Step {step} of 6</div>
      <div className="my-2 h-1.5 w-full rounded-full bg-secondary">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="app">1. Select app</label>
          <input id="app" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Search or paste app slug" value={app} onChange={e => setApp(e.target.value)} />
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">2. Connect wallet (optional)</label>
          <div className="space-y-3">
            {walletData ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-900">
                      Connected: {walletData.address.slice(0, 6)}...{walletData.address.slice(-4)}
                    </div>
                    <VerifiedBadge level={verificationLevel} className="mt-1" />
                  </div>
                  <button 
                    onClick={() => handleConnectWallet(true)} 
                    disabled={isConnecting}
                    className="text-xs text-green-700 hover:text-green-900"
                  >
                    {verificationLevel === 'wallet' ? 'Add Signature' : 'Reconnect'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => handleConnectWallet(false)} 
                  disabled={isConnecting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                <button 
                  onClick={() => handleConnectWallet(true)} 
                  disabled={isConnecting}
                  className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  {isConnecting ? 'Connecting...' : 'Connect + Sign (Verified)'}
                </button>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Connecting your wallet helps build trust. Signing a message provides additional verification.
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">3. Rate (1–5 stars)</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} className={`h-9 rounded-md border px-3 ${rating === n ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`} onClick={() => setRating(n)} aria-pressed={rating === n}>
                {"★".repeat(n)}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="comment">4. Write feedback</label>
          <textarea id="comment" className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={5} placeholder="What stood out?" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
      )}
      {step === 5 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="proof">5. Optional proof</label>
          <input id="proof" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Screenshot URL or tx hash" value={proof} onChange={e => setProof(e.target.value)} />
        </div>
      )}
      {step === 6 && (
        <form className="grid gap-2" action={submitReviewAction}>
          <strong>6. Confirm submission</strong>
          <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">App: {app || "(not provided)"}</div>
            <div className="text-xs text-muted-foreground">Rating: {rating} stars</div>
            <div className="text-xs text-muted-foreground">Comment: {comment ? `${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}` : "(none)"}</div>
            <div className="text-xs text-muted-foreground">Proof: {proof || "(none)"}</div>
            {walletData && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Wallet:</span>
                <span className="text-xs font-mono">{walletData.address.slice(0, 6)}...{walletData.address.slice(-4)}</span>
                <VerifiedBadge level={verificationLevel} showText={false} />
              </div>
            )}
          </div>
          <input type="hidden" name="app" value={app} />
          <input type="hidden" name="rating" value={String(rating)} />
          <input type="hidden" name="comment" value={comment} />
          <input type="hidden" name="txHash" value={proof} />
          {walletData && (
            <>
              <input type="hidden" name="walletAddress" value={walletData.address} />
              <input type="hidden" name="signature" value={walletData.signature || ''} />
              <input type="hidden" name="signatureMessage" value={walletData.message || ''} />
              <input type="hidden" name="verificationLevel" value={verificationLevel} />
            </>
          )}
          <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Submit Review</button>
        </form>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm" onClick={back} disabled={step === 1}>Back</button>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" onClick={next} disabled={step === 6}>Next</button>
      </div>
    </div>
  );
}

export default function NewReview() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <NewReviewInner />
    </Suspense>
  );
}
