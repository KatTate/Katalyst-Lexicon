import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TermStatus } from "@/lib/mockData";

export function StatusBadge({ status, className }: { status: TermStatus; className?: string }) {
  const styles = {
    'Canonical': "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    'Deprecated': "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 line-through decoration-red-800/50",
    'Draft': "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    'In Review': "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  };

  return (
    <Badge variant="outline" className={cn("font-normal px-2.5 py-0.5 shadow-none rounded-full", styles[status], className)}>
      {status}
    </Badge>
  );
}
