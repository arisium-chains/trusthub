import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/actions/auth";

export default function Login() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-4">
      <div className="grid gap-2">
        <h1 className="m-0 text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Login to TrustHub</p>
        <form className="grid gap-2" action={loginAction} method="post">
          <label className="text-xs text-muted-foreground" htmlFor="email">Email</label>
          <input id="email" name="email" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <label className="text-xs text-muted-foreground" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <Button type="submit">Login</Button>
        </form>
        <Button variant="ghost" aria-label="Login with World App (WLD)">Login with World App</Button>
        <div className="text-xs text-muted-foreground">No account? <Link className="underline" href="/auth/signup">Sign up</Link></div>
      </div>
    </div>
  );
}
