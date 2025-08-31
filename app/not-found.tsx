import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mb-4 text-6xl">😕</div>
      <h1 className="text-2xl font-semibold">Page Not Found (404)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Go Home</Link>
        <Link href="/apps" className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm">Browse Apps</Link>
      </div>
    </div>
  );
}

