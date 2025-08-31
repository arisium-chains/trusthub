export default function Usage() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h1 className="text-xl font-semibold">Figma Prompt Pack — Usage</h1>
      <p className="text-sm text-muted-foreground">Copy any section into Google Stitch prompt box to generate Figma frames. Use as a base for the Next.js + PocketBase build.</p>
      <ol className="mt-2 list-decimal pl-6 text-sm text-muted-foreground">
        <li>Open Google Stitch (Gemini for Figma).</li>
        <li>Paste a prompt from the repository README or product brief.</li>
        <li>Iterate, then implement here in code.</li>
      </ol>
    </div>
  );
}
