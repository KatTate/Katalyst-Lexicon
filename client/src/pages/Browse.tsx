import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TermCard } from "@/components/TermCard";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Term, Category } from "@/lib/api";

export default function Browse() {
  const searchParams = new URLSearchParams(window.location.search);
  const activeCategory = searchParams.get("category");

  const { data: terms = [], isLoading: termsLoading } = useQuery<Term[]>({
    queryKey: ["/api/terms"],
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredTerms = activeCategory 
    ? terms.filter(t => t.category === activeCategory)
    : terms;

  const getTermCount = (catName: string) => terms.filter(t => t.category === catName).length;

  const isLoading = termsLoading || catsLoading;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        
        {/* Category Sidebar (Inner) */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Domains
            </h2>
            <div className="space-y-1">
              <Link href="/browse">
                <div className={cn(
                  "px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  !activeCategory 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-foreground hover:bg-muted"
                )} data-testid="link-all-terms">
                  All Terms
                </div>
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/browse?category=${encodeURIComponent(cat.name)}`}>
                  <div className={cn(
                    "px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex justify-between items-center group",
                    activeCategory === cat.name 
                      ? "bg-white border border-border font-medium text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )} data-testid={`link-category-${cat.id}`}>
                    <span>{cat.name}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/10 group-hover:bg-muted-foreground/20",
                      activeCategory === cat.name && "bg-primary/10 text-primary"
                    )}>
                      {getTermCount(cat.name)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2 border-b pb-6">
              <h1 className="text-3xl font-header text-primary">
                {activeCategory || "All Terms"}
              </h1>
              <p className="text-muted-foreground">
                {activeCategory 
                  ? `Canonical definitions for ${activeCategory} domain.` 
                  : "Browsing the complete organization vocabulary."}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredTerms.map(term => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            )}

            {!isLoading && filteredTerms.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                No terms found in this category yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
