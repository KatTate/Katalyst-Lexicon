import { Link } from "wouter";
import { Term } from "@/lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TermCard({ term }: { term: Term }) {
  const isDeprecated = term.status === 'Deprecated';

  return (
    <Link href={`/term/${term.id}`}>
      <div className={cn(
        "group block p-6 bg-card border border-border/50 hover:border-primary/40 hover:shadow-md transition-all duration-300 rounded-lg cursor-pointer h-full flex flex-col relative overflow-hidden",
        isDeprecated && "opacity-75 bg-muted/30 hover:opacity-100"
      )}>
        {/* Hover Highlight Line */}
        <div className="absolute top-0 left-0 w-1 h-0 bg-primary transition-all duration-300 group-hover:h-full opacity-0 group-hover:opacity-100" />
        
        <div className="flex items-start justify-between mb-3 pl-2 transition-all duration-300 group-hover:pl-3">
          <div className="space-y-1">
            <h3 className={cn(
              "text-lg font-serif font-medium leading-tight group-hover:text-primary transition-colors",
              isDeprecated && "line-through decoration-muted-foreground/50 text-muted-foreground"
            )}>
              {term.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {term.category}
            </p>
          </div>
          <StatusBadge status={term.status} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed pl-2 transition-all duration-300 group-hover:pl-3">
          {term.definition}
        </p>

        {term.synonyms.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border/40 flex flex-wrap gap-2 pl-2 transition-all duration-300 group-hover:pl-3">
            <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5" />
            {term.synonyms.slice(0, 2).map(syn => (
              <span key={syn} className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {syn}
              </span>
            ))}
            {term.synonyms.length > 2 && (
              <span className="text-xs text-muted-foreground">+{term.synonyms.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
