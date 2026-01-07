import { Layout } from "@/components/Layout";
import { MOCK_TERMS } from "@/lib/mockData";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Info, AlertTriangle, CheckCircle2, History } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";

export default function TermDetail() {
  const [match, params] = useRoute("/term/:id");
  
  if (!match) return <NotFound />;
  
  const term = MOCK_TERMS.find(t => t.id === params.id);
  if (!term) return <NotFound />;

  const isDeprecated = term.status === 'Deprecated';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link href="/browse">
            <div className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </div>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-6 border-b border-border pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-header font-bold uppercase tracking-wide text-kat-basque bg-kat-basque/10 px-2 py-0.5 rounded">
                  {term.category}
                </span>
                <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 border rounded">
                  v{term.version}.0
                </span>
              </div>
              <h1 className={cn(
                "text-4xl md:text-5xl font-header font-bold text-kat-black tracking-tight",
                isDeprecated && "line-through decoration-destructive/30 text-muted-foreground"
              )}>
                {term.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <StatusBadge status={term.status} className="text-sm px-3 py-1" />
               <Button variant="outline" size="icon" title="Edit Term" className="hover:bg-muted">
                 <Edit className="h-4 w-4" />
               </Button>
               <Button variant="outline" size="icon" title="Share" className="hover:bg-muted">
                 <Share2 className="h-4 w-4" />
               </Button>
            </div>
          </div>

          {isDeprecated && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-destructive">This term is Deprecated</h4>
                <p className="text-sm text-destructive/80 mt-1">
                  It should no longer be used in official documents or communication. 
                  Please check for a replacement or consult the governance guidelines.
                </p>
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none text-kat-charcoal leading-relaxed font-sans">
            <p className="text-lg">{term.definition}</p>
          </div>
        </div>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-border">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 bg-kat-graylight text-kat-charcoal rounded-md">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-1">Why it exists</h3>
                <p className="text-base text-kat-charcoal">{term.why_exists}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
             {term.synonyms.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Synonyms / Also Known As</h3>
                <div className="flex flex-wrap gap-2">
                  {term.synonyms.map(syn => (
                    <span key={syn} className="bg-muted text-foreground px-3 py-1 rounded-md text-sm font-medium border border-border">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-border">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-kat-green">
              <CheckCircle2 className="h-5 w-5" />
              When to use
            </h3>
            <p className="text-kat-charcoal">{term.used_when}</p>
            
            {term.examples_good.length > 0 && (
              <ul className="space-y-3 mt-4">
                {term.examples_good.map((ex, i) => (
                  <li key={i} className="bg-green-50/50 p-4 rounded-md text-sm border-l-4 border-kat-green text-kat-charcoal italic">
                    "{ex}"
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              When NOT to use
            </h3>
            <p className="text-kat-charcoal">{term.not_used_when}</p>
            
            {term.examples_bad.length > 0 && (
              <ul className="space-y-3 mt-4">
                {term.examples_bad.map((ex, i) => (
                  <li key={i} className="bg-red-50/50 p-4 rounded-md text-sm border-l-4 border-destructive text-kat-charcoal/80 line-through decoration-destructive/30 italic">
                    "{ex}"
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="py-8 flex items-center justify-between text-sm text-muted-foreground bg-muted/20 px-6 rounded-lg mt-8 border border-border">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div>
              <span className="font-bold text-foreground">Owner:</span> {term.owner}
            </div>
            <div>
              <span className="font-bold text-foreground">Last Updated:</span> {term.updated_at}
            </div>
            <div>
              <span className="font-bold text-foreground">Visibility:</span> {term.visibility}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-white hover:shadow-sm">
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>

      </div>
    </Layout>
  );
}
