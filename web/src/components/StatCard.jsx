import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary-soft text-primary",
  neutral: "bg-badge-neutral-bg text-badge-neutral",
  blue: "bg-badge-blue-bg text-badge-blue",
  green: "bg-badge-green-bg text-badge-green",
};

// Compact row on phones (single column); icon, label and value stacked from 640px up.
const CARD = "h-full flex-row items-center justify-between gap-3 px-4 py-4 sm:flex-col sm:items-stretch sm:justify-start";
const LABEL = "flex items-center gap-3 sm:flex-col sm:items-start";
const CHIP = "flex size-8 shrink-0 items-center justify-center rounded-md";

const numberFormat = new Intl.NumberFormat();

// One dashboard statistic. Render as a direct child of a <dl> so label and value stay paired.
export function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  return (
    <Card className={CARD}>
      <dt className={cn(LABEL, "text-sm text-muted-foreground")}>
        <span className={cn(CHIP, TONES[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className="text-2xl font-semibold tabular-nums sm:mt-auto">{numberFormat.format(value)}</dd>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className={CARD} aria-hidden="true">
      <div className={LABEL}>
        <div className={cn(CHIP, "bg-muted")} />
        <div className="h-4 w-24 rounded-sm bg-muted" />
      </div>
      <div className="h-8 w-12 rounded-sm bg-muted sm:mt-auto" />
    </Card>
  );
}
