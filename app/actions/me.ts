"use server";
import { getServerPB } from "@/lib/pb-server";
import type { Review } from "@/types/db";

export async function getMyReviews(): Promise<Review[]> {
  const pb = getServerPB();
  const userId = pb.authStore?.model?.id;
  if (!userId) return [];
  const list = await pb.collection("reviews").getFullList({ filter: `user = "${userId}"`, sort: "-created" });
  return list.map((r: any) => ({ id: r.id, app: r.app, user: r.user, rating: r.rating, comment: r.comment, txHash: r.txHash, status: r.status, created: r.created })) as Review[];
}

