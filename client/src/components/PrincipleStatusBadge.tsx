import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PrincipleStatus = "Published" | "Draft" | "Archived";

const styles: Record<PrincipleStatus, string> = {
  Published: "bg-primary/10 text-primary border-primary/20",
  Draft: "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
  Archived: "bg-muted text-muted-foreground border-border",
};

export function PrincipleStatusBadge({ status, className }: { status: PrincipleStatus; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 shadow-none rounded-md", styles[status], className)}
      data-testid={`badge-principle-status-${status.toLowerCase()}`}
    >
      {status}
    </Badge>
  );
}
