import { getPendingReviews, moderateReview } from "@/app/actions/admin";
import { getAppDetail } from "@/app/actions/apps";

export const dynamic = "force-dynamic";

export default async function AdminPanel() {
  let pending: any[] = [];
  try {
    pending = await getPendingReviews();
  } catch {
    pending = [];
  }
  return (
    <div className="grid gap-4">
      <header className="rounded-lg border border-border bg-card p-4">
        <h1 className="m-0 text-xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Moderation, reports, and analytics</p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-base font-semibold">Review moderation queue</h3>
        <div className="my-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{pending.length} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="border-b border-border p-2 text-left">App</th><th className="border-b border-border p-2 text-left">User</th><th className="border-b border-border p-2 text-left">Rating</th><th className="border-b border-border p-2 text-left">Comment</th><th className="border-b border-border p-2 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {await Promise.all(pending.map(async (r: any) => {
                let appName = r.app;
                try { const app = await getAppDetail(r.app); appName = app?.name || appName; } catch {}
                return (
                  <tr key={r.id}>
                    <td className="border-b border-border p-2">{appName}</td>
                    <td className="border-b border-border p-2">{r.user}</td>
                    <td className="border-b border-border p-2">{r.rating}</td>
                    <td className="border-b border-border p-2">{r.comment?.slice(0, 64)}</td>
                    <td className="border-b border-border p-2">
                      <form className="inline" action={async (fd: FormData) => { 'use server'; await moderateReview({ id: r.id, status: 'approved' }); }}>
                        <button className="mr-2 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">Approve</button>
                      </form>
                      <form className="inline" action={async (fd: FormData) => { 'use server'; await moderateReview({ id: r.id, status: 'rejected' }); }}>
                        <button className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs">Reject</button>
                      </form>
                    </td>
                  </tr>
                );
              }))}
              {pending.length === 0 && (
                <tr><td className="p-2 text-sm text-muted-foreground" colSpan={5}>No pending reviews.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-base font-semibold">Analytics</h3>
        <p className="text-sm text-muted-foreground">Charts for reviews/week, active users, trust scores (placeholder).</p>
      </section>
    </div>
  );
}
