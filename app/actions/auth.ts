"use server";
import { cookies } from "next/headers";
import { getServerPB, setPBAuthCookie } from "@/lib/pb-server";

export async function signup({ email, password, name }: { email: string; password: string; name?: string }) {
  const pb = getServerPB();
  await pb.collection("users").create({ email, password, passwordConfirm: password, name });
  await pb.collection("users").authWithPassword(email, password);
  setPBAuthCookie(pb);
  return pb.authStore.model;
}

export async function login({ email, password }: { email: string; password: string }) {
  const pb = getServerPB();
  await pb.collection("users").authWithPassword(email, password);
  setPBAuthCookie(pb);
  return pb.authStore.model;
}

export async function logout() {
  const pb = getServerPB();
  pb.authStore.clear();
  cookies().delete("pb_auth");
}

export async function getCurrentUser() {
  const pb = getServerPB();
  return pb.authStore?.model || null;
}

export async function updateWalletAddress(wallet: string) {
  const pb = getServerPB();
  const user = pb.authStore?.model;
  if (!user) throw new Error("Not authenticated");
  const verification = { ...(user.verification || {}), wallet };
  const updated = await pb.collection("users").update(user.id, { verification });
  return updated;
}

export async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  await login({ email, password });
}

export async function signupAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  await signup({ name, email, password });
}
