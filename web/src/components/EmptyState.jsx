export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card px-6 py-12 text-center">
      {Icon ? <Icon className="size-8 text-muted-foreground" aria-hidden="true" /> : null}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
