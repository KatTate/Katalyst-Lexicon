import { Layout } from "@/components/Layout";
import { MOCK_TERMS, CATEGORIES } from "@/lib/mockData";
import { TermCard } from "@/components/TermCard";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Browse() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const activeCategory = searchParams.get("category");

  const filteredTerms = activeCategory 
    ? MOCK_TERMS.filter(t => t.category === activeCategory)
    : MOCK_TERMS;

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
                )}>
                  All Terms
                </div>
              </Link>
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/browse?category=${encodeURIComponent(cat)}`}>
                  <div className={cn(
                    "px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex justify-between items-center group",
                    activeCategory === cat 
                      ? "bg-white border border-border font-medium text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <span>{cat}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/10 group-hover:bg-muted-foreground/20",
                      activeCategory === cat && "bg-primary/10 text-primary"
                    )}>
                      {MOCK_TERMS.filter(t => t.category === cat).length}
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
              <h1 className="text-3xl font-serif text-primary">
                {activeCategory || "All Terms"}
              </h1>
              <p className="text-muted-foreground">
                {activeCategory 
                  ? `Canonical definitions for ${activeCategory} domain.` 
                  : "Browsing the complete organization vocabulary."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredTerms.map(term => (
                <TermCard key={term.id} term={term} />
              ))}
            </div>

            {filteredTerms.length === 0 && (
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
