import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { getAppDetail } from "@/app/actions/apps";
import { getReviewsByApp } from "@/app/actions/reviews";

export default async function AppDetail({ params }: { params: { slug: string } }) {
  const app = await getAppDetail(params.slug);
  if (!app) return <div className="text-sm text-muted-foreground">App not found</div>;
  const reviews = await getReviewsByApp(app.id);
  // Aggregate is stored in PB; fetch inline to avoid another action
  const pb = (await import("@/lib/pb-server")).getServerPB();
  let score = 0;
  try {
    const agg = await pb.collection("aggregates").getFirstListItem(`app = "${app.id}"`);
    score = agg?.score || 0;
  } catch {}

  return (
    <div className="grid gap-4">
      <header className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="m-0 text-xl font-semibold">{app.name}</h1>
            <div className="text-sm text-muted-foreground">{app.category || "App"} · {app.chain || "Chain"}</div>
          </div>
          <TrustScoreBadge score={score} />
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-base font-semibold">Average Trust Score</h3>
          <p className="text-sm text-muted-foreground" aria-live="polite">{score}/100</p>
          <div className="text-sm text-muted-foreground">Badges: audited, grant recipient</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-base font-semibold">Write a Review</h3>
          <Button asChild><a href={`/reviews/new?app=${app.slug}`}>Start</a></Button>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold">Reviews</h3>
        <div className="grid gap-3">
          {reviews.length === 0 && (
            <div className="text-sm text-muted-foreground">No reviews yet.</div>
          )}
          {/* Map PocketBase records to ReviewCard props */}
          {reviews.map((r: any) => (
            <ReviewCard
              key={r.id}
              review={{
                id: r.id,
                user: r.expand?.user?.name || r.user,
                avatarUrl: undefined,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.created,
                verified: Boolean(r.txHash),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
