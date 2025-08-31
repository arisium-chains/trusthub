"use server";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerPB } from "@/lib/pb-server";
import type { Review } from "@/types/db";
import { recalcTrustScore } from "@/app/actions/trust";
import { getAppDetail } from "@/app/actions/apps";

const TAGS = {
  reviews: (appId: string) => `reviews:${appId}`,
};

export async function getReviewsByApp(appId: string): Promise<Review[]> {
  const pb = getServerPB();
  const list = await pb.collection("reviews").getFullList({
    filter: `app = "${appId}" && status = "approved"`,
    sort: "-created",
  });
  return list.map((r: any) => ({
    id: r.id,
    app: r.app,
    user: r.user,
    rating: r.rating,
    comment: r.comment,
    txHash: r.txHash,
    status: r.status,
    created: r.created,
  })) as Review[];
}

export async function getRecentReviews(limit = 5): Promise<Review[]> {
  const pb = getServerPB();
  const list = await pb.collection("reviews").getList(1, limit, {
    filter: `status = "approved"`,
    sort: "-created",
  });
  return list.items.map((r: any) => ({
    id: r.id,
    app: r.app,
    user: r.user,
    rating: r.rating,
    comment: r.comment,
    txHash: r.txHash,
    status: r.status,
    created: r.created,
  })) as Review[];
}

export async function submitReview(input: { app: string; rating: number; comment: string; txHash?: string }) {
  const pb = getServerPB();
  const userId = pb.authStore?.model?.id;
  if (!userId) throw new Error("Not authenticated");
  const created = await pb.collection("reviews").create({ ...input, user: userId, status: "pending" });
  await recalcTrustScore(input.app);
  revalidateTag(TAGS.reviews(input.app));
  revalidateTag(`app:${input.app}`);
  return { id: created.id, app: created.app, user: created.user, rating: created.rating, comment: created.comment, txHash: created.txHash, status: created.status, created: created.created } as Review;
}

// tags kept internal to this module

// Form-friendly action for client components; accepts FormData and redirects to app detail
export async function submitReviewAction(formData: FormData) {
  "use server";
  const appField = String(formData.get("app") || "").trim();
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "");
  const txHash = String(formData.get("txHash") || "") || undefined;
  const app = await getAppDetail(appField);
  const appId = app?.id || appField;
  await submitReview({ app: appId, rating, comment, txHash });
  const slugForRedirect = app?.slug || appField;
  redirect(`/apps/${slugForRedirect}`);
}
