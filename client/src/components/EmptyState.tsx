import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  "data-testid"?: string;
}

export function EmptyState({ message, actionLabel, actionHref, className, "data-testid": testId }: EmptyStateProps) {
  return (
    <div className={cn("py-20 text-center", className)} data-testid={testId}>
      <p className="text-muted-foreground" data-testid="text-empty-message">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <span className="inline-block mt-4 text-sm font-medium text-primary hover:underline cursor-pointer" data-testid="link-empty-action">
            {actionLabel}
          </span>
        </Link>
      )}
    </div>
  );
}
