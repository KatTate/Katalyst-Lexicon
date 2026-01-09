import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TermCard } from "@/components/TermCard";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Term, Category } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r bg-muted/10 p-6 space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Categories
            </h2>
            <div className="space-y-2">
              <Link href="/browse">
                <div className={cn(
                  "px-3 py-3 rounded-md cursor-pointer transition-colors",
                  !activeCategory 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-foreground hover:bg-muted"
                )} data-testid="link-all-terms">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">All Terms</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      !activeCategory ? "bg-white/20" : "bg-muted-foreground/10"
                    )}>
                      {terms.length}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs mt-1",
                    !activeCategory ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    Browse the complete vocabulary
                  </p>
                </div>
              </Link>
              {categories.map(cat => (
                <Tooltip key={cat.id}>
                  <TooltipTrigger asChild>
                    <Link href={`/browse?category=${encodeURIComponent(cat.name)}`}>
                      <div className={cn(
                        "px-3 py-3 rounded-md cursor-pointer transition-colors group",
                        activeCategory === cat.name 
                          ? "bg-white border border-border text-primary shadow-sm" 
                          : "hover:bg-muted"
                      )} data-testid={`link-category-${cat.id}`}>
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "font-medium text-sm",
                            activeCategory === cat.name ? "text-primary" : "text-foreground"
                          )}>{cat.name}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/10 group-hover:bg-muted-foreground/20",
                            activeCategory === cat.name && "bg-primary/10 text-primary"
                          )}>
                            {getTermCount(cat.name)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {cat.description 
                            ? cat.description.replace(/^Definitions and vocabulary related to\s*/i, '').replace(/\.$/, '')
                            : `Terms related to ${cat.name.toLowerCase()}`}
                        </p>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description || `Terms related to ${cat.name.toLowerCase()}`}</p>
                  </TooltipContent>
                </Tooltip>
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
                  ? categories.find(c => c.name === activeCategory)?.description || `Terms in the ${activeCategory} category.`
                  : "Browse the complete organization vocabulary across all categories."}
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
