/**
 * Empty state component.
 * When `icon` is provided it renders as a small muted icon inside a soft circle.
 * Matches the Stitch screenshot style: centered, ample padding, generous whitespace.
 */
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card px-6 py-16 text-center">
      {Icon ? (
        <div className="flex size-16 items-center justify-center rounded-full bg-muted/70">
          <Icon className="size-8 text-muted-foreground/60" aria-hidden="true" />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
