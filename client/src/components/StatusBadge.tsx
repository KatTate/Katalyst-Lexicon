import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Pencil, Clock } from "lucide-react";

type TermStatus = "Draft" | "In Review" | "Canonical" | "Deprecated";

const statusConfig: Record<TermStatus, { style: string; Icon: typeof CheckCircle2 }> = {
  Canonical: {
    style: "bg-primary/10 text-primary border-primary/20",
    Icon: CheckCircle2,
  },
  Deprecated: {
    style: "bg-destructive/10 text-destructive border-destructive/20 line-through decoration-destructive/50",
    Icon: AlertTriangle,
  },
  Draft: {
    style: "bg-kat-warning/20 text-foreground dark:bg-kat-warning/15 dark:text-kat-warning dark:border-kat-warning/40 border-kat-warning/30",
    Icon: Pencil,
  },
  "In Review": {
    style: "bg-kat-mystical/20 text-foreground dark:bg-kat-mystical/15 dark:text-foreground dark:border-kat-mystical/40 border-kat-mystical/30",
    Icon: Clock,
  },
};

export function StatusBadge({ status, className }: { status: TermStatus; className?: string }) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 shadow-none rounded-md gap-1",
        config.style,
        className
      )}
      data-testid={`badge-status-${status.toLowerCase().replace(" ", "-")}`}
      aria-label={`Status: ${status}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {status}
    </Badge>
  );
}
