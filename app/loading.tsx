export default function Loading() {
  return (
    <div className="flex min-h-[80svh] items-center justify-center pt-24" role="status" aria-label="Laden">
      <span className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-brand-500" />
    </div>
  );
}
