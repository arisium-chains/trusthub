import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
    app?: string;
    rating?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Moderation, reports, and analytics</p>
      </header>
      
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
