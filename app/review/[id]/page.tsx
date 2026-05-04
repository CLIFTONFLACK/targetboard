// Single-post review surface — implemented in Phase 4
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Review: {id}</h1>
      <p className="text-tb-muted text-sm">Asset cards + approval panel — coming in Phase 4.</p>
    </div>
  );
}
