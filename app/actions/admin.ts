"use server";
import { revalidateTag } from "next/cache";
import { getServerPB } from "@/lib/pb-server";

export async function getPendingReviews() {
  const pb = getServerPB();
  const list = await pb.collection("reviews").getFullList({ filter: `status = "pending"`, sort: "created" });
  return list;
}

export async function moderateReview({ id, status, reason }: { id: string; status: "approved" | "rejected"; reason?: string }) {
  const pb = getServerPB();
  const review = await pb.collection("reviews").update(id, { status });
  await pb.collection("audit_logs").create({ type: "review_moderation", ref: id, status, reason });
  revalidateTag(`reviews:${review.app}`);
  return review;
}
