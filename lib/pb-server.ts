import { headers, cookies } from "next/headers";
import { getPocketBase } from "@/lib/pocketbase";

export function getServerPB() {
  const pb = getPocketBase();
  try {
    const cookie = headers().get("cookie") || "";
    // PocketBase SDK can parse its auth cookie from the raw cookie header
    // @ts-ignore
    pb.authStore.loadFromCookie(cookie);
  } catch {}
  return pb;
}

export function setPBAuthCookie(pb: any) {
  try {
    // Export the SDK cookie string and set it via Next cookies API
    const cookieStr = pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: "lax" });
    const match = /pb_auth=([^;]+)/.exec(cookieStr);
    if (match) {
      cookies().set("pb_auth", decodeURIComponent(match[1]), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
  } catch {}
}

