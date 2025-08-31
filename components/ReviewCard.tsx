"use client";
import React from "react";

export type Review = {
  id: string;
  user: string;
  avatarUrl?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date
  verified?: boolean;
};

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm" aria-label={`Review by ${review.user}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={review.avatarUrl || "https://api.dicebear.com/8.x/identicon/svg?seed=" + encodeURIComponent(review.user)}
            alt={review.user}
            width={32}
            height={32}
            className="rounded-full"
          />
          <strong className="text-sm">{review.user}</strong>
        </div>
        <div className="text-yellow-400" title={`${review.rating} stars`} aria-label={`${review.rating} stars`}>
          {"★".repeat(review.rating)}<span className="opacity-30">{"★".repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
      <div className="flex items-center justify-between mt-2">
        <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>
        {review.verified && <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-2.5 py-0.5 text-xs font-semibold">Verified</span>}
      </div>
    </article>
  );
}
