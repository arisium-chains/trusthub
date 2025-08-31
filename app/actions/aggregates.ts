"use server";
import { getServerPB } from "@/lib/pb-server";

export async function getAggregatesForApps(appIds: string[]): Promise<Record<string, number>> {
  if (!appIds.length) return {};
  const pb = getServerPB();
  const filter = appIds.map(id => `app = "${id}"`).join(" || ");
  try {
    const list = await pb.collection("aggregates").getFullList({ filter });
    return Object.fromEntries(list.map((a: any) => [a.app, Number(a.score || 0)]));
  } catch {
    return {};
  }
}

