"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitReviewAction } from "@/app/actions/reviews";

type Step = 1 | 2 | 3 | 4 | 5;

function NewReviewInner() {
  const params = useSearchParams();
  const appFromQuery = params.get("app") || "";
  const [step, setStep] = useState<Step>(1);
  const [app, setApp] = useState(appFromQuery);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [proof, setProof] = useState("");

  const progress = useMemo(() => (step / 5) * 100, [step]);

  function next() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  }
  function back() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4" aria-live="polite">
      <div className="text-xs text-muted-foreground">Step {step} of 5</div>
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
          <label className="text-xs text-muted-foreground">2. Rate (1–5 stars)</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} className={`h-9 rounded-md border px-3 ${rating === n ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`} onClick={() => setRating(n)} aria-pressed={rating === n}>
                {"★".repeat(n)}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="comment">3. Write feedback</label>
          <textarea id="comment" className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={5} placeholder="What stood out?" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
      )}
      {step === 4 && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="proof">4. Optional proof</label>
          <input id="proof" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Screenshot URL or tx hash" value={proof} onChange={e => setProof(e.target.value)} />
        </div>
      )}
      {step === 5 && (
        <form className="grid gap-2" action={submitReviewAction}>
          <strong>Confirm submission</strong>
          <div className="text-xs text-muted-foreground">App: {app || "(not provided)"}</div>
          <div className="text-xs text-muted-foreground">Rating: {rating}</div>
          <div className="text-xs text-muted-foreground">Proof: {proof || "(none)"}</div>
          <input type="hidden" name="app" value={app} />
          <input type="hidden" name="rating" value={String(rating)} />
          <input type="hidden" name="comment" value={comment} />
          <input type="hidden" name="txHash" value={proof} />
          <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Submit</button>
        </form>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm" onClick={back} disabled={step === 1}>Back</button>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" onClick={next} disabled={step === 5}>Next</button>
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
