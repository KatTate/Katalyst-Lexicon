import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Sparkles, TrendingUp } from "lucide-react";
import { MOCK_TERMS } from "@/lib/mockData";
import { TermCard } from "@/components/TermCard";
import { Link } from "wouter";

export default function Home() {
  const [search, setSearch] = useState("");
  
  const filteredTerms = MOCK_TERMS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  const recentTerms = [...MOCK_TERMS].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 3);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-header font-bold text-kat-black tracking-tight">
            The Canonical Source of Truth
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed font-sans max-w-xl mx-auto">
            Search the Lexicon to find organization-wide definitions, standards, and language. 
            Reduce ambiguity and move faster.
          </p>
          
          <div className="relative max-w-xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input 
              className="pl-11 h-14 text-lg bg-white shadow-sm border-border rounded-xl focus-visible:ring-primary focus-visible:border-primary font-sans"
              placeholder="Search for a term, concept, or acronym..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
               <div className="absolute right-3 top-3.5 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                 {filteredTerms.length} results
               </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-kat-wheat" />
              <span>AI-assisted search active</span>
            </span>
          </div>
        </div>

        {/* Search Results (if active) */}
        {search ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-2xl font-header font-bold text-kat-black">Search Results</h2>
            </div>
            {filteredTerms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerms.map(term => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No terms found for "{search}"</p>
                <Link href="/propose">
                  <Button variant="link" className="mt-2 text-primary font-bold">Propose a new term?</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Default Dashboard View */
          <div className="space-y-16 animate-in fade-in delay-150 duration-700">
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-header font-bold text-kat-black">Recently Updated</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary font-medium">View all updates</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentTerms.map(term => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 md:p-12 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-2xl font-header font-bold text-kat-black">Contribute to the Lexicon</h2>
                  <p className="text-muted-foreground text-lg">
                    Spot an ambiguity? Need to define a new project phase? 
                    Submit a draft term for review by the governance committee.
                  </p>
                </div>
                <Link href="/propose">
                  <Button size="lg" className="shrink-0 bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all font-bold">
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
