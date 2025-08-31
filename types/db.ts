export type Id = string;

export type User = {
  id: Id;
  email: string;
  name?: string;
  verification?: {
    wallet?: string;
    worldId?: string;
    twitter?: string;
  };
};

export type App = {
  id: Id;
  slug: string;
  name: string;
  category?: string;
  chain?: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: Id;
  app: Id;
  user: Id;
  rating: number; // 1-5
  comment: string;
  txHash?: string;
  status: ReviewStatus;
  created: string; // ISO
};

export type Aggregate = {
  id: Id;
  app: Id;
  score: number; // 0-100
  updated: string;
};

