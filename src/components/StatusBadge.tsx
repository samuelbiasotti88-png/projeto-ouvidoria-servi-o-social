import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/domain";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-surface text-success",
  warning: "bg-warning-surface text-warning-foreground",
  critical: "bg-critical-surface text-critical",
  scheduled: "bg-scheduled-surface text-scheduled",
  closed: "bg-closed-surface text-closed",
  neutral: "bg-muted text-muted-foreground",
};

const dotClasses: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical",
  scheduled: "bg-scheduled",
  closed: "bg-closed",
  neutral: "bg-muted-foreground",
};

export function StatusBadge({
  tone = "neutral",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dotClasses[tone])} /> : null}
      {children}
    </span>
  );
}
