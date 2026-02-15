import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";
import { api, type PrincipleWithCount } from "@/lib/api";
import { PrincipleCard } from "@/components/PrincipleCard";
import { EmptyState } from "@/components/EmptyState";

export default function BrowsePrinciples() {
  const { data: principles = [], isLoading } = useQuery<PrincipleWithCount[]>({
    queryKey: ["/api/principles"],
    queryFn: () => api.principles.getAll(),
  });

  useEffect(() => {
    document.title = "Principles — Katalyst Lexicon";
    return () => { document.title = "Katalyst Lexicon"; };
  }, []);

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
                <PrincipleCard
                  key={principle.id}
                  principle={principle}
                  linkedTermCount={principle.linkedTermCount}
                  variant="card"
                />
              ))}
            </div>
          )}

          {!isLoading && principles.length === 0 && (
            <EmptyState message="Principles will appear here once they're published" data-testid="empty-principles" />
          )}
        </div>
      </div>
    </Layout>
  );
}
