import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Loader2 } from "lucide-react";
import { TermCard } from "@/components/TermCard";
import { SearchHero } from "@/components/SearchHero";
import { Link } from "wouter";
import { Term } from "@/lib/api";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Katalyst Lexicon";
  }, []);
  const { data: terms = [], isLoading: termsLoading } = useQuery<Term[]>({
    queryKey: ["/api/terms"],
  });

  const recentTerms = [...terms].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 6);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <SearchHero />

        {termsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in delay-150 duration-700">
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-header font-bold text-foreground">Recently Updated</h2>
                </div>
                <Link href="/browse">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary font-medium" data-testid="button-view-all-updates">View all</Button>
                </Link>
              </div>
              {recentTerms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="recently-updated-grid">
                  {recentTerms.map(term => (
                    <TermCard key={term.id} term={term} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                  <p className="text-muted-foreground">No terms have been added yet.</p>
                  <Link href="/propose">
                    <Button variant="link" className="mt-2 text-primary font-bold" data-testid="link-propose-first-term">Be the first to propose a term</Button>
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-2xl font-header font-bold text-foreground">Contribute to the Lexicon</h2>
                  <p className="text-muted-foreground text-lg">
                    Spot an ambiguity? Need to define a new project phase?
                    Submit a draft term for review by the governance committee.
                  </p>
                </div>
                <Link href="/propose">
                  <Button size="lg" className="shrink-0 bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all font-bold" data-testid="button-propose-term">
                    <Plus className="mr-2 h-4 w-4" />
                    Propose New Term
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
