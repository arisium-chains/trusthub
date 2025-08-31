import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signupAction } from "@/app/actions/auth";

export default function Signup() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-4">
      <div className="grid gap-2">
        <h1 className="m-0 text-xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Join TrustHub</p>
        <form className="grid gap-2" action={signupAction} method="post">
          <label className="text-xs text-muted-foreground" htmlFor="name">Name</label>
          <input id="name" name="name" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <label className="text-xs text-muted-foreground" htmlFor="email">Email</label>
          <input id="email" name="email" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <label className="text-xs text-muted-foreground" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <label className="text-xs text-muted-foreground" htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <Button type="submit">Sign up</Button>
        </form>
        <div className="text-xs text-muted-foreground">Have an account? <Link className="underline" href="/auth/login">Login</Link></div>
      </div>
    </div>
  );
}
