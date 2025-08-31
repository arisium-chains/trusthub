// PocketBase client (ESM)
// Install: `npm i pocketbase`
// Env: POCKETBASE_URL or NEXT_PUBLIC_POCKETBASE_URL
import PocketBase from "pocketbase";

export function getPocketBase() {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
  return new PocketBase(url);
}
