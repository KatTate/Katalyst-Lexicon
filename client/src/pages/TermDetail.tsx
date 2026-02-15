import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useRoute, useLocation } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { PrincipleCard } from "@/components/PrincipleCard";
import { TierSection } from "@/components/TierSection";
import { Button } from "@/components/ui/button";
import { Edit, Share2, Info, AlertTriangle, CheckCircle2, History, Loader2, BookOpen, ChevronRight, Home, Eye } from "lucide-react";
import { Link } from "wouter";
import { cn, formatRelativeTime } from "@/lib/utils";
import NotFound from "./not-found";
import { api, Term, Principle, TermVersion } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function TermDetail() {
  const [match, params] = useRoute("/term/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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

  useEffect(() => {
    if (term) {
      document.title = `${term.name} — Katalyst Lexicon`;
    }
    return () => { document.title = "Katalyst Lexicon"; };
  }, [term]);

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
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg flex items-start gap-3 mb-8 dark:bg-amber-950/30 dark:border-amber-700" data-testid="banner-deprecated">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300">This term has been deprecated</h4>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                {(term as Term & { replacementTermId?: string; replacementTermName?: string }).replacementTermId ? (
                  <>
                    See{" "}
                    <Link href={`/term/${(term as Term & { replacementTermId?: string }).replacementTermId}`}>
                      <span className="font-bold underline text-amber-800 dark:text-amber-300 hover:text-amber-900 cursor-pointer" data-testid="link-replacement-term">
                        {(term as Term & { replacementTermName?: string }).replacementTermName || "the replacement term"}
                      </span>
                    </Link>
                    {" "}instead.
                  </>
                ) : (
                  "It should no longer be used in official documents or communication. Please check for a replacement or consult the governance guidelines."
                )}
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
                  "text-4xl md:text-5xl font-header font-bold text-foreground tracking-tight",
                  isDeprecated && "line-through decoration-destructive/30 text-muted-foreground"
                )} data-testid="text-term-name">
                  {term.name}
                </h1>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/propose?editTermId=${params?.id}`}>
                  <Button
                    variant="outline"
                    className="gap-2 hover:bg-muted"
                    data-testid="button-suggest-edit"
                  >
                    <Edit className="h-4 w-4" />
                    Suggest an Edit
                  </Button>
                </Link>
                <Button variant="outline" size="icon" title="Share" className="hover:bg-muted" onClick={handleShare} data-testid="button-share-term">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Definition */}
            <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed font-sans">
              <p className="text-lg" data-testid="text-term-definition">{term.definition}</p>
            </div>
          </div>

          {/* Why it exists + Synonyms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 bg-kat-graylight text-foreground/80 rounded-md shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-1">Why it exists</h2>
                <p className="text-base text-foreground/80" data-testid="text-term-why-exists">{term.whyExists}</p>
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
              <p className="text-foreground/80" data-testid="text-term-used-when">{term.usedWhen}</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                When NOT to use
              </h2>
              <p className="text-foreground/80" data-testid="text-term-not-used-when">{term.notUsedWhen}</p>
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
                          <li key={i} className="bg-green-50/50 dark:bg-green-950/30 p-4 rounded-md text-sm border-l-4 border-kat-green text-foreground/80 italic" data-testid={`text-example-good-${i}`}>
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
                          <li key={i} className="bg-red-50/50 dark:bg-red-950/30 p-4 rounded-md text-sm border-l-4 border-destructive text-foreground/70 line-through decoration-destructive/30 italic" data-testid={`text-example-bad-${i}`}>
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
                <div className="space-y-3" role="list" aria-label="Version history entries">
                  {versions.map((v) => {
                    const isFirst = v.versionNumber === 1;
                    const isCurrent = v.versionNumber === term.version;
                    return (
                      <div key={v.id} className="border rounded-lg p-4 space-y-2" data-testid={`version-entry-${v.versionNumber}`} role="listitem" aria-label={`Version ${v.versionNumber}, by ${v.changedBy}, ${new Date(v.changedAt).toLocaleDateString()}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              v{v.versionNumber}{isFirst ? " — Original" : ""}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold" data-testid={`version-current-badge-${v.versionNumber}`}>Current</span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(v.changedAt).toLocaleDateString()} at {new Date(v.changedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm"><span className="font-medium">Changed by:</span> {v.changedBy}</p>
                        <p className="text-sm"><span className="font-medium">Note:</span> {v.changeNote || <span className="text-muted-foreground italic">No change notes</span>}</p>
                        {!isCurrent && (
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
                    );
                  })}
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
                <p className="text-center text-muted-foreground py-4" data-testid="text-empty-principles">No principles linked to this term</p>
              ) : (
                <div className="space-y-3">
                  {governingPrinciples.map(principle => (
                    <Link key={principle.id} href={`/principle/${principle.slug}`}>
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                        <PrincipleCard principle={principle} variant="inline" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TierSection>
          </div>
        </div>

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
                        <li key={i} className="text-sm text-foreground/80 bg-green-50 dark:bg-green-950/30 p-2 rounded border-l-2 border-green-500">"{ex}"</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(snapshotVersion.snapshotJson as any)?.examplesBad?.length > 0 && (
                  <div>
                    <span className="text-sm font-bold text-red-700">Bad examples</span>
                    <ul className="mt-1 space-y-1">
                      {((snapshotVersion.snapshotJson as any)?.examplesBad || []).map((ex: string, i: number) => (
                        <li key={i} className="text-sm text-foreground/70 bg-red-50 dark:bg-red-950/30 p-2 rounded border-l-2 border-red-500 line-through">"{ex}"</li>
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
      <p className="text-sm text-foreground/80 mt-0.5">{value}</p>
    </div>
  );
}
