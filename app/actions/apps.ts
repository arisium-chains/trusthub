"use server";
import { revalidateTag } from "next/cache";
import { getServerPB } from "@/lib/pb-server";
import type { App } from "@/types/db";
import { redirect } from "next/navigation";

const TAGS = {
  apps: "apps:list",
  app: (id: string) => `app:${id}`,
};

export async function getApps(): Promise<App[]> {
  const pb = getServerPB();
  const list = await pb.collection("apps").getFullList({ sort: "name" });
  return list.map((r: any) => ({ id: r.id, slug: r.slug, name: r.name, category: r.category, chain: r.chain })) as App[];
}

export async function getAppDetail(idOrSlug: string): Promise<App | null> {
  const pb = getServerPB();
  try {
    const app = await pb.collection("apps").getFirstListItem(`id = "${idOrSlug}" || slug = "${idOrSlug}"`);
    return { id: app.id, slug: app.slug, name: app.name, category: app.category, chain: app.chain } as App;
  } catch {
    return null;
  }
}

export async function getRecentApps(limit = 6): Promise<App[]> {
  const pb = getServerPB();
  const list = await pb.collection("apps").getList(1, limit, { sort: "-created" });
  return list.items.map((r: any) => ({ id: r.id, slug: r.slug, name: r.name, category: r.category, chain: r.chain })) as App[];
}

export async function submitApp(data: { name: string; slug: string; category?: string; chain?: string }) {
  const pb = getServerPB();
  const created = await pb.collection("apps").create(data);
  revalidateTag(TAGS.apps);
  return { id: created.id, slug: created.slug, name: created.name, category: created.category, chain: created.chain } as App;
}

export async function submitAppAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const category = String(formData.get("category") || "").trim() || undefined;
  const chain = String(formData.get("chain") || "").trim() || undefined;
  if (!name || !slug) throw new Error("Name and slug are required");
  await submitApp({ name, slug, category, chain });
  redirect(`/apps/${slug}`);
}

// Server action for useFormState with inline slug uniqueness validation
export async function createAppValidated(prevState: { ok?: boolean; error?: string; slug?: string } | null, formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const category = String(formData.get("category") || "").trim() || undefined;
  const chain = String(formData.get("chain") || "").trim() || undefined;
  if (!name || !slug) return { ok: false, error: "Name and slug are required" };
  const pb = getServerPB();
  // Check uniqueness by slug
  try {
    await pb.collection("apps").getFirstListItem(`slug = "${slug}"`);
    return { ok: false, error: "Slug is already taken" };
  } catch {
    // not found => ok to create
  }
  const created = await submitApp({ name, slug, category, chain });
  return { ok: true, slug: created.slug };
}
