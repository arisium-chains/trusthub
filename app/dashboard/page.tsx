import Link from "next/link";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { getMyReviews } from "@/app/actions/me";
import { getRecentApps } from "@/app/actions/apps";
import { getAggregatesForApps } from "@/app/actions/aggregates";
import { getCurrentUser } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  const myReviews = await getMyReviews();
  let recentApps: Awaited<ReturnType<typeof getRecentApps>> = [];
  try {
    recentApps = await getRecentApps(6);
  } catch {
    recentApps = [];
  }
  const scores = await getAggregatesForApps(recentApps.map(a => a.id));
  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <aside className="sticky top-16 h-max">
        <nav className="grid gap-1 text-sm">
          <Link className="rounded-md bg-secondary px-3 py-2" href="#">Home</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-secondary/50" href="#reviews">My Reviews</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-secondary/50" href="/reviews/new">Submit App</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-secondary/50" href="#settings">Settings</Link>
        </nav>
      </aside>

      <section className="grid gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <div className="text-xs text-muted-foreground">Trust Score</div>
            <h2 className="m-0 text-lg font-semibold">Your Overview</h2>
          </div>
          <TrustScoreBadge score={86} />
        </div>

        <div id="reviews" className="grid gap-3">
          <h3 className="text-base font-semibold">My Reviews</h3>
          {!user && <div className="text-sm text-muted-foreground">Please log in to see your reviews.</div>}
          {user && myReviews.length === 0 && <div className="text-sm text-muted-foreground">You haven&apos;t posted any reviews yet.</div>}
          {user && myReviews.map((r: any) => (
            <ReviewCard key={r.id} review={{ id: r.id, user: user.name || user.email || 'You', rating: r.rating, comment: r.comment, createdAt: r.created, verified: Boolean(r.txHash) }} />
          ))}
          <div>
            <Button asChild><Link href="/reviews/new">Write New Review</Link></Button>
          </div>
        </div>

        <div id="recent-apps" className="grid gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Apps</h3>
            <div className="flex items-center gap-2 text-xs">
              <a href="/apps" className="text-muted-foreground hover:text-foreground">View All</a>
              {user && <a href="/apps/new" className="inline-flex items-center rounded-md border px-2.5 py-1 hover:bg-secondary/50">Create App</a>}
            </div>
          </div>
          {recentApps.length === 0 && (
            <div className="text-sm text-muted-foreground">No apps yet.</div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {recentApps.map((app) => (
              <Link key={app.id} href={`/apps/${app.slug}`} className="rounded-md border border-border bg-card p-3 hover:opacity-90">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{app.name}</div>
                  <span className="text-xs text-muted-foreground">{(scores[app.id] ?? 0)}/100</span>
                </div>
                <div className="text-xs text-muted-foreground">{app.category || 'App'} · {app.chain || 'Chain'}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
