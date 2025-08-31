import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TrustHub",
  description: "TrustHub — community reviews and trust signals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-border/80 backdrop-blur">
            <div className="container flex h-14 items-center justify-between">
              <a className="font-extrabold tracking-tight" href="/">TrustHub</a>
              <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
                <a href="/dashboard" className="hover:text-foreground">Dashboard</a>
                <a href="/apps" className="hover:text-foreground">Apps</a>
                <a href="/apps/demo-app" className="hover:text-foreground">App Detail</a>
                <a href="/reviews/new" className="hover:text-foreground">Write Review</a>
                <a href="/admin" className="hover:text-foreground">Admin</a>
                <a href="/auth/login" className="hover:text-foreground">Login</a>
              </nav>
            </div>
          </header>
          <main className="container flex-1 py-6">{children}</main>
          <footer className="border-t border-border py-6 text-xs text-muted-foreground">
            <div className="container">© {new Date().getFullYear()} TrustHub</div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
