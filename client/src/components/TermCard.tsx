import { Link } from "wouter";
import { Term } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import { CornerDownRight } from "lucide-react";
import { cn, formatRelativeTime, highlightMatch } from "@/lib/utils";

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || query.length < 2) return <>{text}</>;

  const segments = highlightMatch(text, query);
  return (
    <>
      {segments.map((seg, i) => (
        <span key={i}>
          {seg.before}
          {seg.match && <strong className="text-primary font-bold">{seg.match}</strong>}
          {seg.after}
        </span>
      ))}
    </>
  );
}

interface TermCardProps {
  term: Term;
  highlightQuery?: string;
}

export function TermCard({ term, highlightQuery }: TermCardProps) {
  const isDeprecated = term.status === 'Deprecated';

  return (
    <Link href={`/term/${term.id}`}>
      <div className={cn(
        "group block p-6 bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200 rounded-lg cursor-pointer h-full flex flex-col relative",
        isDeprecated && "opacity-75 bg-muted/30"
      )} data-testid={`card-term-${term.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1 min-w-0 flex-1 mr-2">
            <h3 className={cn(
              "text-lg font-header font-bold leading-tight group-hover:text-primary transition-colors text-kat-black",
              isDeprecated && "line-through decoration-muted-foreground/50 text-muted-foreground"
            )}>
              <HighlightText text={term.name} query={highlightQuery} />
            </h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
              {term.category}
            </p>
          </div>
          <StatusBadge status={term.status} />
        </div>

        <p className="text-base text-kat-charcoal line-clamp-2 mb-5 flex-1 leading-relaxed font-sans">
          <HighlightText text={term.definition} query={highlightQuery} />
        </p>

        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span data-testid={`freshness-${term.id}`}>{formatRelativeTime(term.updatedAt)}</span>
            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold" data-testid={`version-${term.id}`}>v{term.version}</span>
          </div>

          {term.synonyms && term.synonyms.length > 0 && (
            <div className="flex items-center gap-1.5">
              <CornerDownRight className="h-3 w-3 text-muted-foreground/70" />
              {term.synonyms.slice(0, 2).map(syn => (
                <span key={syn} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                  <HighlightText text={syn} query={highlightQuery} />
                </span>
              ))}
              {term.synonyms.length > 2 && (
                <span className="text-xs text-muted-foreground px-1">+{term.synonyms.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
