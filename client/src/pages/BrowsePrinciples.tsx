import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Loader2, User } from "lucide-react";
import { Principle, api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function PrincipleStatusBadge({ status }: { status: Principle["status"] }) {
  const styles = {
    Published: "bg-primary/10 text-primary border-primary/20",
    Draft: "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
    Archived: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={cn("font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 shadow-none rounded-md", styles[status])}>
      {status}
    </Badge>
  );
}

export default function BrowsePrinciples() {
  const { data: principles = [], isLoading } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
    queryFn: () => api.principles.getAll(),
  });

  return (
    <Layout>
      <div className="p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 border-b pb-6">
            <h1 className="text-3xl font-header text-primary" data-testid="text-principles-title">
              Principles
            </h1>
            <p className="text-muted-foreground">
              Core guidelines and principles that inform our approach.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-principles">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="principles-grid">
              {principles.map(principle => (
                <Link key={principle.id} href={`/principle/${principle.slug}`}>
                  <div
                    className="bg-white border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                    data-testid={`card-principle-${principle.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-header font-bold text-lg text-kat-charcoal group-hover:text-primary transition-colors" data-testid={`text-title-${principle.id}`}>
                        {principle.title}
                      </h3>
                      <PrincipleStatusBadge status={principle.status} />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-summary-${principle.id}`}>
                      {principle.summary}
                    </p>

                    {principle.tags.length > 0 && (
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

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span data-testid={`text-owner-${principle.id}`}>{principle.owner}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && principles.length === 0 && (
            <div className="py-20 text-center text-muted-foreground" data-testid="empty-principles">
              No principles found yet.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
