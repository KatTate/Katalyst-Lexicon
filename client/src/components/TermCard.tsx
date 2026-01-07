import { Link } from "wouter";
import { Term } from "@/lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TermCard({ term }: { term: Term }) {
  const isDeprecated = term.status === 'Deprecated';

  return (
    <Link href={`/term/${term.id}`}>
      <div className={cn(
        "group block p-6 bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200 rounded-lg cursor-pointer h-full flex flex-col relative",
        isDeprecated && "opacity-75 bg-muted/30"
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className={cn(
              "text-lg font-header font-bold leading-tight group-hover:text-primary transition-colors text-kat-black",
              isDeprecated && "line-through decoration-muted-foreground/50 text-muted-foreground"
            )}>
              {term.name}
            </h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
              {term.category}
            </p>
          </div>
          <StatusBadge status={term.status} />
        </div>

        <p className="text-base text-kat-charcoal line-clamp-3 mb-5 flex-1 leading-relaxed font-sans">
          {term.definition}
        </p>

        {term.synonyms.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border/40 flex flex-wrap gap-2">
            <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5" />
            {term.synonyms.slice(0, 2).map(syn => (
              <span key={syn} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-medium">
                {syn}
              </span>
            ))}
            {term.synonyms.length > 2 && (
              <span className="text-xs text-muted-foreground py-1 px-1">+{term.synonyms.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
