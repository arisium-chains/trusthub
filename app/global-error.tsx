"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-4 text-6xl">🚨</div>
          <h1 className="text-2xl font-semibold">Critical Error</h1>
          <p className="mt-2 text-sm text-muted-foreground">A fatal error occurred while rendering the app.</p>
          {error?.digest && (
            <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Reload</button>
          </div>
        </div>
      </body>
    </html>
  );
}

