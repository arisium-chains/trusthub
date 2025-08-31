"use server";
import { getServerPB } from "@/lib/pb-server";

function staleDaysWeight(createdISO: string) {
  const days = Math.max(0, (Date.now() - new Date(createdISO).getTime()) / 86400000);
  // 0-30 days: 1.0 → 0.6; 30+ days floor at 0.6
  return Math.max(0.6, 1 - Math.min(30, days) * (0.4 / 30));
}

export async function recalcTrustScore(appId: string) {
  const pb = getServerPB();
  const reviews = await pb.collection("reviews").getFullList({
    filter: `app = "${appId}" && status = "approved"`,
    sort: "-created",
  });

  if (!reviews.length) {
    await upsertAggregate(pb, appId, 0);
    return 0;
  }

  let total = 0;
  for (const r of reviews) {
    const rating_overall = (r.rating / 5) * 100;
    const user = await pb.collection("users").getOne(r.user);
    const verification = user?.verification || {};
    const reviewer_verification = (
      (verification.wallet ? 0.5 : 0) +
      (verification.worldId ? 0.3 : 0) +
      (verification.twitter ? 0.2 : 0)
    ) * 100;
    const onchain_proof = r.txHash ? 100 : 0;
    const recency_weight = staleDaysWeight(r.created) * 100; // 60–100
    const reviewer_reputation = 50; // TODO: replace with real signal later

    const score =
      0.40 * rating_overall +
      0.25 * reviewer_verification +
      0.15 * onchain_proof +
      0.10 * recency_weight +
      0.10 * reviewer_reputation;
    total += score;
  }
  const avg = Math.round(total / reviews.length);
  await upsertAggregate(pb, appId, avg);
  return avg;
}

async function upsertAggregate(pb: any, appId: string, score: number) {
  try {
    const agg = await pb.collection("aggregates").getFirstListItem(`app = "${appId}"`);
    await pb.collection("aggregates").update(agg.id, { score });
  } catch {
    await pb.collection("aggregates").create({ app: appId, score });
  }
}

