import { Link } from "wouter";
import { Principle } from "@/lib/api";
import { PrincipleStatusBadge } from "./PrincipleStatusBadge";
import { cn } from "@/lib/utils";

interface PrincipleCardProps {
  principle: Principle;
  linkedTermCount?: number;
  variant?: "card" | "inline";
}

function PrincipleCardContent({ principle, linkedTermCount, variant = "card" }: PrincipleCardProps) {
  const isInline = variant === "inline";

  return (
    <div
      className={cn(
        isInline
          ? "flex flex-col"
          : "group block p-6 bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200 rounded-lg cursor-pointer h-full flex flex-col"
      )}
      data-testid={isInline ? `linked-principle-${principle.id}` : `card-principle-${principle.id}`}
    >
      <div className={cn("flex items-start justify-between", !isInline && "mb-3")}>
        <h3
          className={cn(
            isInline
              ? "text-sm font-header font-bold leading-tight text-foreground"
              : "text-lg font-header font-bold leading-tight group-hover:text-primary transition-colors text-foreground"
          )}
          data-testid={`text-title-${principle.id}`}
        >
          {principle.title}
        </h3>
        <PrincipleStatusBadge status={principle.status} />
      </div>

      <p
        className={cn(
          "text-muted-foreground line-clamp-2 leading-relaxed font-sans",
          isInline ? "text-sm mt-1" : "text-sm mb-4"
        )}
        data-testid={`text-summary-${principle.id}`}
      >
        {principle.summary}
      </p>

      {!isInline && principle.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {principle.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded"
              data-testid={`tag-${tag}`}
            >
              {tag}
            </span>
          ))}
          {principle.tags.length > 4 && (
            <span className="text-xs text-muted-foreground">+{principle.tags.length - 4}</span>
          )}
        </div>
      )}

      {!isInline && linkedTermCount !== undefined && (
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground" data-testid={`text-linked-terms-${principle.id}`}>
          <span>{linkedTermCount} linked {linkedTermCount === 1 ? "term" : "terms"}</span>
        </div>
      )}
    </div>
  );
}

export function PrincipleCard({ principle, linkedTermCount, variant = "card" }: PrincipleCardProps) {
  if (variant === "inline") {
    return <PrincipleCardContent principle={principle} linkedTermCount={linkedTermCount} variant="inline" />;
  }

  return (
    <Link href={`/principle/${principle.slug}`}>
      <PrincipleCardContent principle={principle} linkedTermCount={linkedTermCount} variant="card" />
    </Link>
  );
}
