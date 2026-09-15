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
    <div className="glass-panel p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("font-display mt-2 text-3xl font-bold", valueTone[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
