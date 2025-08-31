import { getCurrentUser } from "@/app/actions/auth";
import CreateAppForm from "./CreateAppForm";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-4">
      <h1 className="m-0 text-xl font-semibold">Create App</h1>
      {!user && <p className="text-sm text-muted-foreground">Please log in to create an app.</p>}
      {user && <CreateAppForm />}
    </div>
  );
}
