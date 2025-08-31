"use client";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { createAppValidated } from "@/app/actions/apps";
import { useRouter } from "next/navigation";

const initialState = null as any;

export default function CreateAppForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(createAppValidated as any, initialState);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok && state?.slug) {
      setToast("App created successfully");
      const t = setTimeout(() => {
        router.push(`/apps/${state.slug}`);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <>
      {toast && (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center">
          <div className="rounded-md border border-green-400 bg-green-50 px-4 py-2 text-sm text-green-700 shadow">
            {toast}
          </div>
        </div>
      )}
      <form className="mt-3 grid gap-2" action={formAction}>
        <label className="text-xs text-muted-foreground" htmlFor="name">Name</label>
        <input id="name" name="name" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />

        <label className="text-xs text-muted-foreground" htmlFor="slug">Slug</label>
        <input id="slug" name="slug" required pattern="[a-z0-9-]+" title="lowercase, numbers and hyphens" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
        {state?.error && <div className="text-xs text-red-500">{state.error}</div>}

        <label className="text-xs text-muted-foreground" htmlFor="category">Category</label>
        <input id="category" name="category" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />

        <label className="text-xs text-muted-foreground" htmlFor="chain">Blockchain</label>
        <input id="chain" name="chain" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />

        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create</button>
      </form>
    </>
  );
}

