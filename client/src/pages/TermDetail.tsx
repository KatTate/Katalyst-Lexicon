import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useRoute, useLocation } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Info, AlertTriangle, CheckCircle2, History, Loader2, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";
import { api, Term, Principle } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function TermDetail() {
  const [match, params] = useRoute("/term/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  
  const { data: term, isLoading, error } = useQuery<Term>({
    queryKey: ["/api/terms", params?.id],
    queryFn: () => api.terms.get(params?.id || ""),
    enabled: !!params?.id,
  });

  const { data: governingPrinciples = [] } = useQuery<Principle[]>({
    queryKey: ["/api/terms", params?.id, "principles"],
    queryFn: () => api.terms.getPrinciples(params?.id || ""),
    enabled: !!params?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Term>) => api.terms.update(params?.id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({ title: "Term Updated", description: "Your changes have been saved." });
      setEditOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update term.", variant: "destructive" });
    },
  });

  const [editForm, setEditForm] = useState({
    definition: "",
    whyExists: "",
    usedWhen: "",
    notUsedWhen: "",
  });

  const handleEditOpen = () => {
    if (term) {
      setEditForm({
        definition: term.definition,
        whyExists: term.whyExists,
        usedWhen: term.usedWhen,
        notUsedWhen: term.notUsedWhen,
      });
    }
    setEditOpen(true);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "Term link copied to clipboard." });
    } catch {
      toast({ title: "Share", description: "Could not copy link to clipboard." });
    }
  };
  
  if (!match) return <NotFound />;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !term) return <NotFound />;

  const isDeprecated = term.status === 'Deprecated';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link href="/browse">
            <div className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-back-browse">
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
              )} data-testid="text-term-name">
                {term.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <StatusBadge status={term.status} className="text-sm px-3 py-1" />
               <Dialog open={editOpen} onOpenChange={setEditOpen}>
                 <DialogTrigger asChild>
                   <Button variant="outline" size="icon" title="Edit Term" className="hover:bg-muted" onClick={handleEditOpen} data-testid="button-edit-term">
                     <Edit className="h-4 w-4" />
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-2xl">
                   <DialogHeader>
                     <DialogTitle className="font-header font-bold">Edit Term</DialogTitle>
                     <DialogDescription>Make changes to this term's definition and usage rules.</DialogDescription>
                   </DialogHeader>
                   <div className="space-y-4 py-4">
                     <div className="space-y-2">
                       <Label>Definition</Label>
                       <Textarea 
                         value={editForm.definition}
                         onChange={(e) => setEditForm(f => ({...f, definition: e.target.value}))}
                         rows={3}
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Why it exists</Label>
                       <Input 
                         value={editForm.whyExists}
                         onChange={(e) => setEditForm(f => ({...f, whyExists: e.target.value}))}
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label>Used When</Label>
                         <Textarea 
                           value={editForm.usedWhen}
                           onChange={(e) => setEditForm(f => ({...f, usedWhen: e.target.value}))}
                           rows={2}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label>Not Used When</Label>
                         <Textarea 
                           value={editForm.notUsedWhen}
                           onChange={(e) => setEditForm(f => ({...f, notUsedWhen: e.target.value}))}
                           rows={2}
                         />
                       </div>
                     </div>
                   </div>
                   <DialogFooter>
                     <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                     <Button 
                       className="bg-primary text-white font-bold" 
                       onClick={() => updateMutation.mutate(editForm)}
                       disabled={updateMutation.isPending}
                       data-testid="button-save-edit"
                     >
                       {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                       Save Changes
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
               <Button variant="outline" size="icon" title="Share" className="hover:bg-muted" onClick={handleShare} data-testid="button-share-term">
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
            <p className="text-lg" data-testid="text-term-definition">{term.definition}</p>
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
                <p className="text-base text-kat-charcoal">{term.whyExists}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
             {term.synonyms && term.synonyms.length > 0 && (
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
            <p className="text-kat-charcoal">{term.usedWhen}</p>
            
            {term.examplesGood && term.examplesGood.length > 0 && (
              <ul className="space-y-3 mt-4">
                {term.examplesGood.map((ex, i) => (
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
            <p className="text-kat-charcoal">{term.notUsedWhen}</p>
            
            {term.examplesBad && term.examplesBad.length > 0 && (
              <ul className="space-y-3 mt-4">
                {term.examplesBad.map((ex, i) => (
                  <li key={i} className="bg-red-50/50 p-4 rounded-md text-sm border-l-4 border-destructive text-kat-charcoal/80 line-through decoration-destructive/30 italic">
                    "{ex}"
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Governing Principles */}
        {governingPrinciples.length > 0 && (
          <div className="py-8 border-b border-border">
            <h3 className="font-bold text-lg flex items-center gap-2 text-kat-charcoal mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              Governing Principles
            </h3>
            <div className="space-y-3">
              {governingPrinciples.map(principle => (
                <Link key={principle.id} href={`/principle/${principle.slug}`}>
                  <div 
                    className="bg-primary/5 border border-primary/20 p-4 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                    data-testid={`link-principle-${principle.id}`}
                  >
                    <h4 className="font-bold text-primary">{principle.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{principle.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Metadata */}
        <div className="py-8 flex items-center justify-between text-sm text-muted-foreground bg-muted/20 px-6 rounded-lg mt-8 border border-border">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div>
              <span className="font-bold text-foreground">Owner:</span> {term.owner}
            </div>
            <div>
              <span className="font-bold text-foreground">Last Updated:</span> {new Date(term.updatedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-bold text-foreground">Visibility:</span> {term.visibility}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 hover:bg-white hover:shadow-sm" 
            onClick={() => toast({ title: "Version History", description: "Full version history tracking is coming soon. This feature will show all changes made to this term over time." })}
            data-testid="button-view-history"
          >
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>

      </div>
    </Layout>
  );
}
