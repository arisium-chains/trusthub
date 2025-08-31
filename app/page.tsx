import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { getRecentReviews } from "@/app/actions/reviews";

export const dynamic = "force-dynamic";

export default async function Page() {
  let recent: Awaited<ReturnType<typeof getRecentReviews>> = [];
  try {
    recent = await getRecentReviews(5);
  } catch {
    recent = [];
  }
  return (
    <div>
      <section className="py-10 text-center md:py-16">
        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">Trust, Verified.</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Community reviews, blockchain‑verified apps, and credibility metrics in one place.
          Designed mobile‑first and inspired by the reference images in <code>/design</code>.
        </p>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2">
          <Button asChild><Link href="/dashboard">Explore Reviews</Link></Button>
          <Button variant="ghost" asChild><Link href="/reviews/new">Submit App Review</Link></Button>
        </div>
      </section>

      <section className="my-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-base font-semibold">Transparent Reviews</h3>
            <p className="text-sm text-muted-foreground">Clear, authentic feedback from real users.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-base font-semibold">Blockchain Verified</h3>
            <p className="text-sm text-muted-foreground">Optional on‑chain proofs and audit badges.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-base font-semibold">Community Trust Score</h3>
            <p className="text-sm text-muted-foreground">Simple badge reflecting credibility over time.</p>
          </div>
        </div>
      </section>

      <section className="my-6">
        <h2 className="mb-2 text-lg font-semibold">Live reviews</h2>
        <div className="grid gap-3">
          {recent.length === 0 && (
            <div className="text-sm text-muted-foreground">No reviews yet.</div>
          )}
          {recent.map((r: any) => (
            <ReviewCard key={r.id} review={{ id: r.id, user: r.user, rating: r.rating, comment: r.comment, createdAt: r.created, verified: Boolean(r.txHash) }} />
          ))}
        </div>
      </section>

      <section className="my-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <strong>Build trust with your app</strong>
            <p className="text-sm text-muted-foreground">Add proofs and engage the community.</p>
          </div>
          <Button asChild><Link href="/reviews/new">Write a Review</Link></Button>
        </div>
      </section>
    </div>
  );
}
