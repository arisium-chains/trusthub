"use server";
import { revalidateTag } from "next/cache";
import { getServerPB } from "@/lib/pb-server";

interface ReviewFilters {
  status?: "pending" | "approved" | "rejected" | "shadowbanned";
  app?: string;
  user?: string;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface PaginationOptions {
  page?: number;
  perPage?: number;
}

export async function getReviews(filters: ReviewFilters = {}, pagination: PaginationOptions = {}) {
  const pb = getServerPB();
  
  const { page = 1, perPage = 20 } = pagination;
  const filterConditions: string[] = [];
  
  if (filters.status) {
    filterConditions.push(`status = "${filters.status}"`);
  }
  
  if (filters.app) {
    filterConditions.push(`app = "${filters.app}"`);
  }
  
  if (filters.user) {
    filterConditions.push(`user = "${filters.user}"`);
  }
  
  if (filters.rating) {
    filterConditions.push(`rating = ${filters.rating}`);
  }
  
  if (filters.dateFrom) {
    filterConditions.push(`created >= "${filters.dateFrom}"`);
  }
  
  if (filters.dateTo) {
    filterConditions.push(`created <= "${filters.dateTo}"`);
  }
  
  if (filters.search) {
    filterConditions.push(`(comment ~ "${filters.search}" || app.name ~ "${filters.search}" || user.name ~ "${filters.search}")`);
  }
  
  const filter = filterConditions.length > 0 ? filterConditions.join(" && ") : "";
  
  const result = await pb.collection("reviews").getList(page, perPage, {
    filter,
    sort: "-created",
    expand: "app,user"
  });
  
  return result;
}

export async function getPendingReviews() {
  return getReviews({ status: "pending" });
}

export async function moderateReview({ 
  id, 
  status, 
  reason, 
  adminId 
}: { 
  id: string; 
  status: "approved" | "rejected" | "shadowbanned"; 
  reason?: string;
  adminId: string;
}) {
  const pb = getServerPB();
  
  // Update review status
  const review = await pb.collection("reviews").update(id, { status });
  
  // Log the moderation action
  await pb.collection("audit_logs").create({
    type: "review_moderation",
    ref: id,
    admin: adminId,
    details: JSON.stringify({ status, reason })
  });
  
  // If shadowbanned, also log user action
  if (status === "shadowbanned") {
    await pb.collection("audit_logs").create({
      type: "user_shadowban",
      ref: review.user,
      admin: adminId,
      details: JSON.stringify({ reason: `Review ${id} shadowbanned: ${reason}` })
    });
  }
  
  revalidateTag(`reviews:${review.app}`);
  return review;
}

export async function bulkModerateReviews({
  reviewIds,
  status,
  reason,
  adminId
}: {
  reviewIds: string[];
  status: "approved" | "rejected" | "shadowbanned";
  reason?: string;
  adminId: string;
}) {
  const pb = getServerPB();
  const results = [];
  
  for (const id of reviewIds) {
    try {
      const result = await moderateReview({ id, status, reason, adminId });
      results.push({ id, success: true, result });
    } catch (error) {
      results.push({ id, success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  
  return results;
}

export async function getAuditLogs(filters: { type?: string; admin?: string; dateFrom?: string; dateTo?: string } = {}, pagination: PaginationOptions = {}) {
  const pb = getServerPB();
  
  const { page = 1, perPage = 50 } = pagination;
  const filterConditions: string[] = [];
  
  if (filters.type) {
    filterConditions.push(`type = "${filters.type}"`);
  }
  
  if (filters.admin) {
    filterConditions.push(`admin = "${filters.admin}"`);
  }
  
  if (filters.dateFrom) {
    filterConditions.push(`created >= "${filters.dateFrom}"`);
  }
  
  if (filters.dateTo) {
    filterConditions.push(`created <= "${filters.dateTo}"`);
  }
  
  const filter = filterConditions.length > 0 ? filterConditions.join(" && ") : "";
  
  const result = await pb.collection("audit_logs").getList(page, perPage, {
    filter,
    sort: "-created",
    expand: "admin"
  });
  
  return result;
}

export async function getModerationStats() {
  const pb = getServerPB();
  
  const [pending, approved, rejected, shadowbanned] = await Promise.all([
    pb.collection("reviews").getList(1, 1, { filter: 'status = "pending"' }),
    pb.collection("reviews").getList(1, 1, { filter: 'status = "approved"' }),
    pb.collection("reviews").getList(1, 1, { filter: 'status = "rejected"' }),
    pb.collection("reviews").getList(1, 1, { filter: 'status = "shadowbanned"' })
  ]);
  
  return {
    pending: pending.totalItems,
    approved: approved.totalItems,
    rejected: rejected.totalItems,
    shadowbanned: shadowbanned.totalItems,
    total: pending.totalItems + approved.totalItems + rejected.totalItems + shadowbanned.totalItems
  };
}
