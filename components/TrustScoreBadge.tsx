"use client";
import React from "react";

export function TrustScoreBadge({ score }: { score: number }) {
  const variant = score >= 90 ? "gold" : score >= 70 ? "silver" : score >= 50 ? "bronze" : "red";
  const label = score >= 90 ? "High Trust" : score >= 70 ? "Good Trust" : score >= 50 ? "Moderate" : "Warning";
  const classes =
    variant === "gold"
      ? "bg-amber-100 text-amber-900"
      : variant === "silver"
      ? "bg-gray-200 text-gray-800"
      : variant === "bronze"
      ? "bg-orange-100 text-orange-900"
      : "bg-red-100 text-red-900";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`} aria-label={`Trust score ${score} - ${label}`}>
      {label}: {Math.round(score)}
    </span>
  );
}
