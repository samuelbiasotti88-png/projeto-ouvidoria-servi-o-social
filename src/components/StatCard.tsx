import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/domain";

const valueTone: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning-foreground",
  critical: "text-critical",
  scheduled: "text-primary",
  closed: "text-closed",
  neutral: "text-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="glass-panel relative overflow-hidden p-4 sm:p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          tone === "critical" ? "bg-critical" : tone === "warning" ? "bg-warning" : "bg-primary/60",
        )}
      />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display mt-2 text-[32px] font-semibold tracking-tight",
          valueTone[tone],
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
