import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary-soft text-primary",
  neutral: "bg-badge-neutral-bg text-badge-neutral",
  blue: "bg-badge-blue-bg text-badge-blue",
  green: "bg-badge-green-bg text-badge-green",
};

const numberFormat = new Intl.NumberFormat();

// One dashboard statistic matching the visual layout of the reference screenshot.
export function StatCard({ label, value, icon: Icon, tone = "primary", detail }) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow">
      <dt className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", TONES[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </dt>
      <dd className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
          {numberFormat.format(value)}
        </span>
        {detail && (
          <span className="text-sm font-medium text-muted-foreground">
            {detail}
          </span>
        )}
      </dd>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl border bg-card" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="size-8 rounded-md bg-muted" />
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="h-10 w-12 rounded-lg bg-muted" />
      </div>
    </Card>
  );
}
