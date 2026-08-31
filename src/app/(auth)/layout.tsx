export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-black">
            A
          </div>
          <span className="text-xl font-black tracking-tight">Ascend</span>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
