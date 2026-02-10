import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useRoute, useLocation } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { TierSection } from "@/components/TierSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share2, Info, AlertTriangle, CheckCircle2, History, Loader2, BookOpen, Plus, X, ChevronRight, Home, Eye } from "lucide-react";
import { Link } from "wouter";
import { cn, formatRelativeTime } from "@/lib/utils";
import NotFound from "./not-found";
import { api, Term, Principle, TermVersion, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function TermDetail() {
  const [match, params] = useRoute("/term/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [snapshotVersion, setSnapshotVersion] = useState<TermVersion | null>(null);

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

  const { data: versions = [], isLoading: versionsLoading } = useQuery<TermVersion[]>({
    queryKey: ["/api/terms", params?.id, "versions"],
    queryFn: () => api.terms.getVersions(params?.id || ""),
    enabled: !!params?.id,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (term) {
      document.title = `${term.name} — Katalyst Lexicon`;
    }
    return () => { document.title = "Katalyst Lexicon"; };
  }, [term]);

  const [editForm, setEditForm] = useState({
    definition: "",
    whyExists: "",
    usedWhen: "",
    notUsedWhen: "",
    category: "",
    changeNote: "",
  });
  const [editExamplesGood, setEditExamplesGood] = useState<string[]>([]);
  const [editExamplesBad, setEditExamplesBad] = useState<string[]>([]);
  const [editSynonyms, setEditSynonyms] = useState<string[]>([]);
  const [newGoodExample, setNewGoodExample] = useState("");
  const [newBadExample, setNewBadExample] = useState("");
  const [newSynonym, setNewSynonym] = useState("");

  const editProposalMutation = useMutation({
    mutationFn: () => api.proposals.create({
      termId: params?.id || "",
      termName: term?.name || "",
      category: editForm.category,
      type: "edit",
      status: "pending",
      submittedBy: "Current User",
      changesSummary: editForm.changeNote,
      definition: editForm.definition,
      whyExists: editForm.whyExists,
      usedWhen: editForm.usedWhen,
      notUsedWhen: editForm.notUsedWhen,
      examplesGood: editExamplesGood,
      examplesBad: editExamplesBad,
      synonyms: editSynonyms,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Edit Submitted", description: "Your suggested edit has been submitted for review." });
      setEditOpen(false);
      setEditForm({ definition: "", whyExists: "", usedWhen: "", notUsedWhen: "", category: "", changeNote: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit edit proposal.", variant: "destructive" });
    },
  });

  const handleEditOpen = () => {
    if (term) {
      setEditForm({
        definition: term.definition,
        whyExists: term.whyExists,
        usedWhen: term.usedWhen,
        notUsedWhen: term.notUsedWhen,
        category: term.category,
        changeNote: "",
      });
      setEditExamplesGood(term.examplesGood || []);
      setEditExamplesBad(term.examplesBad || []);
      setEditSynonyms(term.synonyms || []);
      setNewGoodExample("");
      setNewBadExample("");
      setNewSynonym("");
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
  const hasExamples = (term.examplesGood && term.examplesGood.length > 0) || (term.examplesBad && term.examplesBad.length > 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8" data-testid="breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/">
                <span className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer" data-testid="breadcrumb-home">
                  <Home className="h-3.5 w-3.5" />
                  Home
                </span>
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              <Link href="/browse">
                <span className="hover:text-primary transition-colors cursor-pointer" data-testid="breadcrumb-category">
                  {term.category}
                </span>
              </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              <span className="font-medium text-foreground" data-testid="breadcrumb-term">{term.name}</span>
            </li>
          </ol>
        </nav>

        {/* Deprecated Banner */}
        {isDeprecated && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3 mb-8" data-testid="banner-deprecated">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-destructive">This term has been deprecated</h4>
              <p className="text-sm text-destructive/80 mt-1">
                It should no longer be used in official documents or communication.
                Please check for a replacement or consult the governance guidelines.
              </p>
            </div>
          </div>
        )}

        {/* ===== TIER 1: Always Visible ===== */}
        <div className="space-y-8">

          {/* Header */}
          <div className="space-y-6 border-b border-border pb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-header font-bold uppercase tracking-wide text-kat-basque bg-kat-basque/10 px-2 py-0.5 rounded" data-testid="text-term-category">
                    {term.category}
                  </span>
                  <StatusBadge status={term.status} className="text-sm px-3 py-1" />
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 border rounded" data-testid="text-term-version">
                    v{term.version}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid="text-term-freshness">
                    {formatRelativeTime(term.updatedAt)}
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
                <Button
                  variant="outline"
                  className="gap-2 hover:bg-muted"
                  onClick={handleEditOpen}
                  data-testid="button-suggest-edit"
                >
                  <Edit className="h-4 w-4" />
                  Suggest an Edit
                </Button>
                <Button variant="outline" size="icon" title="Share" className="hover:bg-muted" onClick={handleShare} data-testid="button-share-term">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Definition */}
            <div className="prose prose-lg max-w-none text-kat-charcoal leading-relaxed font-sans">
              <p className="text-lg" data-testid="text-term-definition">{term.definition}</p>
            </div>
          </div>

          {/* Why it exists + Synonyms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 bg-kat-graylight text-kat-charcoal rounded-md shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-1">Why it exists</h2>
                <p className="text-base text-kat-charcoal" data-testid="text-term-why-exists">{term.whyExists}</p>
              </div>
            </div>

            {term.synonyms && term.synonyms.length > 0 && (
              <div>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Synonyms / Also Known As</h2>
                <div className="flex flex-wrap gap-2" data-testid="text-term-synonyms">
                  {term.synonyms.map(syn => (
                    <span key={syn} className="bg-muted text-foreground px-3 py-1 rounded-md text-sm font-medium border border-border">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Usage Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border" data-testid="section-usage-guidance">
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-kat-green">
                <CheckCircle2 className="h-5 w-5" />
                When to use
              </h2>
              <p className="text-kat-charcoal" data-testid="text-term-used-when">{term.usedWhen}</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                When NOT to use
              </h2>
              <p className="text-kat-charcoal" data-testid="text-term-not-used-when">{term.notUsedWhen}</p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 px-6 py-4 rounded-lg border border-border" data-testid="section-metadata">
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
          </div>

          {/* ===== TIER 2: Collapsible Sections ===== */}
          <div className="space-y-4 pt-4">

            {/* Examples Section */}
            {hasExamples && (
              <TierSection
                id="examples"
                title="Examples"
                icon={<CheckCircle2 className="h-5 w-5" />}
                badge={
                  <Badge variant="secondary" className="text-xs">
                    {(term.examplesGood?.length || 0) + (term.examplesBad?.length || 0)}
                  </Badge>
                }
                data-testid="tier-section-examples"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {term.examplesGood && term.examplesGood.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-kat-green flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Good usage
                      </h3>
                      <ul className="space-y-3">
                        {term.examplesGood.map((ex, i) => (
                          <li key={i} className="bg-green-50/50 p-4 rounded-md text-sm border-l-4 border-kat-green text-kat-charcoal italic" data-testid={`text-example-good-${i}`}>
                            "{ex}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {term.examplesBad && term.examplesBad.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Avoid this
                      </h3>
                      <ul className="space-y-3">
                        {term.examplesBad.map((ex, i) => (
                          <li key={i} className="bg-red-50/50 p-4 rounded-md text-sm border-l-4 border-destructive text-kat-charcoal/80 line-through decoration-destructive/30 italic" data-testid={`text-example-bad-${i}`}>
                            "{ex}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TierSection>
            )}

            {/* Version History Section */}
            <TierSection
              id="version-history"
              title="Version History"
              icon={<History className="h-5 w-5" />}
              badge={
                <Badge variant="secondary" className="text-xs">
                  {versions.length > 0 ? versions.length : "..."}
                </Badge>
              }
              data-testid="tier-section-version-history"
            >
              {versionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : versions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No version history available.</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((v) => (
                    <div key={v.id} className="border rounded-lg p-4 space-y-2" data-testid={`version-entry-${v.versionNumber}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">Version {v.versionNumber}</span>
                          {v.versionNumber === term.version && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold" data-testid={`version-current-badge-${v.versionNumber}`}>Current</span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(v.changedAt).toLocaleDateString()} at {new Date(v.changedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm"><span className="font-medium">Changed by:</span> {v.changedBy}</p>
                      <p className="text-sm"><span className="font-medium">Note:</span> {v.changeNote || <span className="text-muted-foreground italic">No change notes</span>}</p>
                      {v.versionNumber !== term.version && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs mt-1"
                          onClick={() => setSnapshotVersion(v)}
                          data-testid={`button-view-snapshot-${v.versionNumber}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View full snapshot
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TierSection>

            {/* Related Principles Section */}
            <TierSection
              id="related-principles"
              title="Related Principles"
              icon={<BookOpen className="h-5 w-5" />}
              badge={
                governingPrinciples.length > 0 ? (
                  <Badge variant="secondary" className="text-xs">{governingPrinciples.length}</Badge>
                ) : undefined
              }
              data-testid="tier-section-related-principles"
            >
              {governingPrinciples.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No principles are linked to this term yet.</p>
              ) : (
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
              )}
            </TierSection>
          </div>
        </div>

        {/* Edit Proposal Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-header font-bold text-xl">Suggest an Edit to "{term.name}"</DialogTitle>
              <DialogDescription>Propose changes to this term. Your edit will be reviewed before being applied.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Label className="font-bold text-amber-900">Why are you making this change? *</Label>
                <Textarea
                  value={editForm.changeNote}
                  onChange={(e) => setEditForm(f => ({...f, changeNote: e.target.value}))}
                  placeholder="e.g. Updated to reflect new company policy, Fixed typo in definition, Added missing usage context..."
                  rows={2}
                  className="mt-2"
                  data-testid="input-edit-change-note"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(val) => setEditForm(f => ({...f, category: val}))}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Definition</Label>
                <Textarea
                  value={editForm.definition}
                  onChange={(e) => setEditForm(f => ({...f, definition: e.target.value}))}
                  rows={3}
                  data-testid="input-edit-definition"
                />
              </div>

              <div className="space-y-2">
                <Label>Why it exists</Label>
                <Input
                  value={editForm.whyExists}
                  onChange={(e) => setEditForm(f => ({...f, whyExists: e.target.value}))}
                  data-testid="input-edit-why-exists"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Used When</Label>
                  <Textarea
                    value={editForm.usedWhen}
                    onChange={(e) => setEditForm(f => ({...f, usedWhen: e.target.value}))}
                    rows={2}
                    data-testid="input-edit-used-when"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Not Used When</Label>
                  <Textarea
                    value={editForm.notUsedWhen}
                    onChange={(e) => setEditForm(f => ({...f, notUsedWhen: e.target.value}))}
                    rows={2}
                    data-testid="input-edit-not-used-when"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-3 border border-dashed">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Synonyms</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a synonym..."
                    value={newSynonym}
                    onChange={(e) => setNewSynonym(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newSynonym.trim()) { setEditSynonyms([...editSynonyms, newSynonym.trim()]); setNewSynonym(""); } } }}
                    data-testid="input-edit-synonym"
                  />
                  <Button type="button" variant="outline" onClick={() => { if (newSynonym.trim()) { setEditSynonyms([...editSynonyms, newSynonym.trim()]); setNewSynonym(""); } }} data-testid="button-edit-add-synonym">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editSynonyms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editSynonyms.map((syn, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {syn}
                        <button type="button" onClick={() => setEditSynonyms(editSynonyms.filter((_, idx) => idx !== i))} className="ml-1 hover:bg-muted rounded" data-testid={`button-edit-remove-synonym-${i}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-dashed">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Examples</h3>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-green-700">Good Usage Examples</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a good usage example..."
                      value={newGoodExample}
                      onChange={(e) => setNewGoodExample(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newGoodExample.trim()) { setEditExamplesGood([...editExamplesGood, newGoodExample.trim()]); setNewGoodExample(""); } } }}
                      data-testid="input-edit-good-example"
                    />
                    <Button type="button" variant="outline" onClick={() => { if (newGoodExample.trim()) { setEditExamplesGood([...editExamplesGood, newGoodExample.trim()]); setNewGoodExample(""); } }} data-testid="button-edit-add-good-example">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editExamplesGood.length > 0 && (
                    <ul className="space-y-1">
                      {editExamplesGood.map((ex, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                          <span className="text-green-600">&#10003;</span>
                          <span className="flex-1">{ex}</span>
                          <button type="button" onClick={() => setEditExamplesGood(editExamplesGood.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive" data-testid={`button-edit-remove-good-example-${i}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-red-700">Bad Usage Examples</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a bad usage example..."
                      value={newBadExample}
                      onChange={(e) => setNewBadExample(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newBadExample.trim()) { setEditExamplesBad([...editExamplesBad, newBadExample.trim()]); setNewBadExample(""); } } }}
                      data-testid="input-edit-bad-example"
                    />
                    <Button type="button" variant="outline" onClick={() => { if (newBadExample.trim()) { setEditExamplesBad([...editExamplesBad, newBadExample.trim()]); setNewBadExample(""); } }} data-testid="button-edit-add-bad-example">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editExamplesBad.length > 0 && (
                    <ul className="space-y-1">
                      {editExamplesBad.map((ex, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                          <span className="text-red-600">&#10007;</span>
                          <span className="flex-1">{ex}</span>
                          <button type="button" onClick={() => setEditExamplesBad(editExamplesBad.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive" data-testid={`button-edit-remove-bad-example-${i}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button
                className="bg-primary text-white font-bold"
                onClick={() => editProposalMutation.mutate()}
                disabled={editProposalMutation.isPending || !editForm.changeNote.trim()}
                data-testid="button-submit-edit"
              >
                {editProposalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Edit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version Snapshot Dialog */}
        <Dialog open={!!snapshotVersion} onOpenChange={(open) => { if (!open) setSnapshotVersion(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version {snapshotVersion?.versionNumber} Snapshot
              </DialogTitle>
              <DialogDescription>
                How "{term.name}" looked at version {snapshotVersion?.versionNumber} — {snapshotVersion && new Date(snapshotVersion.changedAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            {snapshotVersion && (
              <div className="space-y-4 py-4" data-testid={`snapshot-content-${snapshotVersion.versionNumber}`}>
                <SnapshotField label="Definition" value={(snapshotVersion.snapshotJson as any)?.definition} />
                <SnapshotField label="Why it exists" value={(snapshotVersion.snapshotJson as any)?.whyExists} />
                <SnapshotField label="When to use" value={(snapshotVersion.snapshotJson as any)?.usedWhen} />
                <SnapshotField label="When NOT to use" value={(snapshotVersion.snapshotJson as any)?.notUsedWhen} />
                <SnapshotField label="Category" value={(snapshotVersion.snapshotJson as any)?.category} />
                <SnapshotField label="Status" value={(snapshotVersion.snapshotJson as any)?.status} />
                <SnapshotField label="Visibility" value={(snapshotVersion.snapshotJson as any)?.visibility} />
                <SnapshotField label="Owner" value={(snapshotVersion.snapshotJson as any)?.owner} />
                {(snapshotVersion.snapshotJson as any)?.synonyms?.length > 0 && (
                  <div>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Synonyms</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {((snapshotVersion.snapshotJson as any)?.synonyms || []).map((s: string, i: number) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(snapshotVersion.snapshotJson as any)?.examplesGood?.length > 0 && (
                  <div>
                    <span className="text-sm font-bold text-green-700">Good examples</span>
                    <ul className="mt-1 space-y-1">
                      {((snapshotVersion.snapshotJson as any)?.examplesGood || []).map((ex: string, i: number) => (
                        <li key={i} className="text-sm text-kat-charcoal bg-green-50 p-2 rounded border-l-2 border-green-500">"{ex}"</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(snapshotVersion.snapshotJson as any)?.examplesBad?.length > 0 && (
                  <div>
                    <span className="text-sm font-bold text-red-700">Bad examples</span>
                    <ul className="mt-1 space-y-1">
                      {((snapshotVersion.snapshotJson as any)?.examplesBad || []).map((ex: string, i: number) => (
                        <li key={i} className="text-sm text-kat-charcoal/80 bg-red-50 p-2 rounded border-l-2 border-red-500 line-through">"{ex}"</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}

function SnapshotField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      <p className="text-sm text-kat-charcoal mt-0.5">{value}</p>
    </div>
  );
}
