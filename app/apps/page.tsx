import Link from "next/link";
import { getApps } from "@/app/actions/apps";

export const dynamic = "force-dynamic";

export default async function AppsListPage() {
  let apps: Awaited<ReturnType<typeof getApps>> = [];
  try {
    apps = await getApps();
  } catch {
    apps = [];
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {apps.length === 0 && (
        <div className="text-sm text-muted-foreground">No apps yet.</div>
      )}
      {apps.map(app => (
        <Link key={app.id} href={`/apps/${app.slug}`} className="rounded-lg border border-border bg-card p-4 hover:opacity-90">
          <div className="text-base font-semibold">{app.name}</div>
          <div className="text-xs text-muted-foreground">{app.category || "App"} · {app.chain || "Chain"}</div>
        </Link>
      ))}
    </div>
  );
}

