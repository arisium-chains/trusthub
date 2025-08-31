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

export async function getReviewsByApp(appId: string): Promise<any[]> {
  const pb = getServerPB();
  const list = await pb.collection("reviews").getFullList({
    filter: `app = "${appId}" && status = "approved"`,
    sort: "-created",
    expand: "user",
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
    expand: r.expand,
  })) as Review[];
}

export async function getRecentReviews(limit = 5): Promise<Review[]> {
  const pb = getServerPB();
  const list = await pb.collection("reviews").getList(1, limit, {
    filter: `status = "approved"`,
    sort: "-created",
    expand: "user",
  });
  return list.items.map((r: any) => ({
    id: r.id,
    app: r.app,
    user: r.expand?.user?.name || r.user,
    rating: r.rating,
    comment: r.comment,
    txHash: r.txHash,
    status: r.status,
    created: r.created,
  })) as Review[];
}

export async function submitReview(input: { 
  app: string; 
  rating: number; 
  comment: string; 
  txHash?: string;
  walletAddress?: string;
  signature?: string;
  signatureMessage?: string;
  verificationLevel?: string;
}) {
  const pb = getServerPB();
  const userId = pb.authStore?.model?.id;
  if (!userId) throw new Error("Not authenticated");
  
  // Prepare review data with verification fields
  const reviewData = {
    ...input,
    user: userId,
    status: "pending",
    // Add verification flags based on verification level
    signatureVerified: input.verificationLevel === 'signature' || input.verificationLevel === 'worldid',
    worldIdVerified: input.verificationLevel === 'worldid'
  };
  
  const created = await pb.collection("reviews").create(reviewData);
  await recalcTrustScore(input.app);
  revalidateTag(TAGS.reviews(input.app));
  revalidateTag(`app:${input.app}`);
  return { 
    id: created.id, 
    app: created.app, 
    user: created.user, 
    rating: created.rating, 
    comment: created.comment, 
    txHash: created.txHash, 
    status: created.status, 
    created: created.created,
    walletAddress: created.walletAddress,
    signature: created.signature,
    signatureVerified: created.signatureVerified,
    worldIdVerified: created.worldIdVerified
  } as Review;
}

// tags kept internal to this module

// Form-friendly action for client components; accepts FormData and redirects to app detail
export async function submitReviewAction(formData: FormData) {
  "use server";
  const appField = String(formData.get("app") || "").trim();
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "");
  const txHash = String(formData.get("txHash") || "") || undefined;
  
  // Extract wallet verification fields
  const walletAddress = String(formData.get("walletAddress") || "") || undefined;
  const signature = String(formData.get("signature") || "") || undefined;
  const signatureMessage = String(formData.get("signatureMessage") || "") || undefined;
  const verificationLevel = String(formData.get("verificationLevel") || "") || undefined;
  
  const app = await getAppDetail(appField);
  const appId = app?.id || appField;
  
  await submitReview({ 
    app: appId, 
    rating, 
    comment, 
    txHash,
    walletAddress,
    signature,
    signatureMessage,
    verificationLevel
  });
  
  const slugForRedirect = app?.slug || appField;
  redirect(`/apps/${slugForRedirect}`);
}
