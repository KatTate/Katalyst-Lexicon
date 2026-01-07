import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TermStatus } from "@/lib/mockData";

export function StatusBadge({ status, className }: { status: TermStatus; className?: string }) {
  const styles = {
    'Canonical': "bg-primary/10 text-primary border-primary/20", // Uses brand green
    'Deprecated': "bg-destructive/10 text-destructive border-destructive/20 line-through decoration-destructive/50", // Uses brand red
    'Draft': "bg-kat-warning/20 text-yellow-800 border-kat-warning/30", // Uses brand warning
    'In Review': "bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30", // Uses brand mystical
  };

  return (
    <Badge variant="outline" className={cn("font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 shadow-none rounded-md", styles[status], className)}>
      {status}
    </Badge>
  );
}
