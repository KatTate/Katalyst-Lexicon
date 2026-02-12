import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2, XCircle, MessageSquare, Clock, Eye,
  ChevronRight, User, Loader2, ClipboardCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { api, Proposal, ProposalEvent, Term } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function DiffField({ label, oldValue, newValue, testId }: { label: string; oldValue: string; newValue: string; testId: string }) {
  const changed = oldValue !== newValue;
  if (!changed && !newValue) return null;
  
  return (
    <div data-testid={testId} className="space-y-1">
      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
      {changed ? (
        <div className="space-y-2">
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-900">
            <span className="font-bold text-red-600 text-xs uppercase mr-2">Current:</span>
            {oldValue || <span className="italic text-muted-foreground">empty</span>}
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-900">
            <span className="font-bold text-green-600 text-xs uppercase mr-2">Proposed:</span>
            {newValue || <span className="italic text-muted-foreground">empty</span>}
          </div>
        </div>
      ) : (
        <p className="text-kat-charcoal text-sm">{newValue}</p>
      )}
    </div>
  );
}

function DiffArrayField({ label, oldValue, newValue, testId }: { label: string; oldValue: string[]; newValue: string[]; testId: string }) {
  const old = oldValue || [];
  const next = newValue || [];
  const oldSet = new Set(old);
  const newSet = new Set(next);
  const changed = old.length !== next.length || old.some(v => !newSet.has(v)) || next.some(v => !oldSet.has(v));
  
  if (!changed && next.length === 0) return null;

  const removed = old.filter(v => !newSet.has(v));
  const added = next.filter(v => !oldSet.has(v));
  const kept = next.filter(v => oldSet.has(v));

  return (
    <div data-testid={testId} className="space-y-1">
      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
      {changed ? (
        <div className="space-y-2">
          {removed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <span className="font-bold text-red-600 text-xs uppercase mr-2">Removed:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {removed.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-red-300 text-red-800 line-through">{v}</Badge>
                ))}
              </div>
            </div>
          )}
          {added.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <span className="font-bold text-green-600 text-xs uppercase mr-2">Added:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {added.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-green-300 text-green-800">{v}</Badge>
                ))}
              </div>
            </div>
          )}
          {kept.length > 0 && (
            <div className="bg-muted/30 border border-border rounded p-3">
              <span className="font-bold text-muted-foreground text-xs uppercase mr-2">Unchanged:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {kept.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-border text-muted-foreground">{v}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {next.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-sm">{v}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const MOCK_CURRENT_USER = { name: "Sarah Jenkins", role: "Admin" as const };

export default function ReviewQueue() {
  const [selectedItem, setSelectedItem] = useState<Proposal | null>(null);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canReview = MOCK_CURRENT_USER.role === "Admin" || MOCK_CURRENT_USER.role === "Approver";

  useEffect(() => {
    document.title = "Review Queue — Katalyst Lexicon";
  }, []);

  if (!canReview) {
    return (
      <Layout>
        <div className="p-8 max-w-2xl mx-auto text-center" data-testid="permission-denied-review">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-header font-bold text-kat-charcoal mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to review proposals.</p>
        </div>
      </Layout>
    );
  }

  const { data: allProposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: originalTerm } = useQuery<Term>({
    queryKey: ["/api/terms", selectedItem?.termId],
    queryFn: () => api.terms.get(selectedItem?.termId || ""),
    enabled: !!selectedItem?.termId && selectedItem?.type === "edit",
  });

  // Fetch full proposal detail (with events) when selected
  const { data: proposalDetail } = useQuery<Proposal & { events?: ProposalEvent[] }>({
    queryKey: ["/api/proposals", selectedItem?.id],
    queryFn: () => api.proposals.get(selectedItem?.id || ""),
    enabled: !!selectedItem?.id,
  });

  // Sort oldest-first so nothing gets buried in the review queue
  const sortedProposals = [...allProposals].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const proposals = activeTab === "all"
    ? sortedProposals
    : sortedProposals.filter(p => {
        if (activeTab === "pending") return p.status === "pending";
        if (activeTab === "review") return p.status === "in_review";
        if (activeTab === "changes") return p.status === "changes_requested";
        return true;
      });

  const pendingCount = allProposals.filter(i => i.status === 'pending').length;
  const inReviewCount = allProposals.filter(i => i.status === 'in_review').length;
  const changesCount = allProposals.filter(i => i.status === 'changes_requested').length;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handle409Error = (error: unknown) => {
    // Check for 409 Conflict (race condition)
    const is409 = error instanceof Error && error.message?.includes("409");
    if (is409) {
      toast({ title: "Already reviewed", description: "This proposal has already been reviewed", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      setSelectedItem(null);
    }
    return is409;
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.approve(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({ title: "Proposal approved", description: "Proposal approved — term has been published" });
      setSelectedItem(null);
      setComment("");
    },
    onError: (error) => {
      if (!handle409Error(error)) {
        toast({ title: "Error", description: "Failed to approve proposal.", variant: "destructive" });
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.reject(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal rejected", description: "Proposal rejected" });
      setSelectedItem(null);
      setComment("");
    },
    onError: (error) => {
      if (!handle409Error(error)) {
        toast({ title: "Error", description: "Failed to reject proposal.", variant: "destructive" });
      }
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.requestChanges(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Feedback sent", description: "Feedback sent to the proposer" });
      setSelectedItem(null);
      setComment("");
    },
    onError: (error) => {
      if (!handle409Error(error)) {
        toast({ title: "Error", description: "Failed to request changes.", variant: "destructive" });
      }
    },
  });

  const StatusBadge = ({ status }: { status: Proposal['status'] }) => {
    const styles: Record<string, string> = {
      'pending': "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
      'in_review': "bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30",
      'changes_requested': "bg-destructive/10 text-destructive border-destructive/20",
      'approved': "bg-primary/10 text-primary border-primary/20",
      'rejected': "bg-muted text-muted-foreground border-border",
      'withdrawn': "bg-gray-100 text-gray-600 border-gray-300",
    };
    const labels: Record<string, string> = {
      'pending': "Pending",
      'in_review': "In Review",
      'changes_requested': "Changes Requested",
      'approved': "Approved",
      'rejected': "Rejected",
      'withdrawn': "Withdrawn",
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wide", styles[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const formatAbsoluteDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending || requestChangesMutation.isPending;
  const isEditProposal = selectedItem?.type === "edit" && originalTerm;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-screen">
        
        {/* Left Panel - Queue List */}
        <div className="w-full lg:w-[400px] border-r border-border bg-white flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-header font-bold text-kat-black">Review Queue</h1>
            <p className="text-sm text-muted-foreground mt-1">Approve or request changes on proposed terms</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 grid grid-cols-4 bg-muted/50">
              <TabsTrigger value="all" className="text-xs" data-testid="tab-all">All ({allProposals.length})</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs" data-testid="tab-pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="review" className="text-xs" data-testid="tab-review">Review ({inReviewCount})</TabsTrigger>
              <TabsTrigger value="changes" className="text-xs" data-testid="tab-changes">Changes ({changesCount})</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : proposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid="empty-state-review-queue" aria-live="polite">
                  <ClipboardCheck className="h-12 w-12 text-primary/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "all"
                      ? "No proposals waiting for review — the team is all caught up!"
                      : "No proposals in this category"}
                  </p>
                </div>
              ) : (
                proposals.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      selectedItem?.id === item.id 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border bg-white hover:border-primary/50"
                    )}
                    data-testid={`proposal-card-${item.id}`}
                    aria-label={`${item.type === 'new' ? 'New' : 'Edit'} proposal: ${item.termName}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold uppercase",
                          item.type === 'new' ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800 border-amber-300"
                        )}>
                          {item.type === 'new' ? 'New' : 'Edit'}
                        </Badge>
                        <StatusBadge status={item.status} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-header font-bold text-kat-black mb-1">{item.termName}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.submittedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 bg-background overflow-y-auto">
          {selectedItem ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-xs font-bold uppercase",
                      selectedItem.type === 'new' ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800 border-amber-300"
                    )}>
                      {selectedItem.type === 'new' ? 'New Term Proposal' : 'Edit Proposal'}
                    </Badge>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                  <h2 className="text-3xl font-header font-bold text-kat-black" data-testid="text-proposal-name">{selectedItem.termName}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.category}</p>
                </div>
                {selectedItem.termId && (
                  <Link href={`/term/${selectedItem.termId}`}>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-term">
                      <Eye className="h-4 w-4" />
                      View Current Term
                    </Button>
                  </Link>
                )}
              </div>

              {/* Changes Summary / Change Note */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-header">
                    {isEditProposal ? "Reason for Edit" : "Changes Summary"}
                  </CardTitle>
                  <CardDescription>
                    {isEditProposal ? "Why this edit is being proposed" : "What's being proposed"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-kat-charcoal" data-testid="text-changes-summary">{selectedItem.changesSummary}</p>
                </CardContent>
              </Card>

              {/* Edit Proposal: Diff View */}
              {isEditProposal && (
                <Card className="mb-6 border-amber-200 bg-amber-50/30">
                  <CardHeader>
                    <CardTitle className="text-lg font-header">Proposed Changes</CardTitle>
                    <CardDescription>Comparing current term with proposed edits. Changed fields are highlighted.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DiffField 
                      label="Category" 
                      oldValue={originalTerm.category} 
                      newValue={selectedItem.category} 
                      testId="diff-category" 
                    />
                    <DiffField 
                      label="Definition" 
                      oldValue={originalTerm.definition} 
                      newValue={selectedItem.definition} 
                      testId="diff-definition" 
                    />
                    <DiffField 
                      label="Why This Term Exists" 
                      oldValue={originalTerm.whyExists} 
                      newValue={selectedItem.whyExists} 
                      testId="diff-why-exists" 
                    />
                    <DiffField 
                      label="Used When" 
                      oldValue={originalTerm.usedWhen} 
                      newValue={selectedItem.usedWhen} 
                      testId="diff-used-when" 
                    />
                    <DiffField 
                      label="Not Used When" 
                      oldValue={originalTerm.notUsedWhen} 
                      newValue={selectedItem.notUsedWhen} 
                      testId="diff-not-used-when" 
                    />
                    <DiffArrayField 
                      label="Good Examples" 
                      oldValue={originalTerm.examplesGood} 
                      newValue={selectedItem.examplesGood} 
                      testId="diff-good-examples" 
                    />
                    <DiffArrayField 
                      label="Bad Examples" 
                      oldValue={originalTerm.examplesBad} 
                      newValue={selectedItem.examplesBad} 
                      testId="diff-bad-examples" 
                    />
                    <DiffArrayField 
                      label="Synonyms" 
                      oldValue={originalTerm.synonyms} 
                      newValue={selectedItem.synonyms} 
                      testId="diff-synonyms" 
                    />
                  </CardContent>
                </Card>
              )}

              {/* New Term Proposal: Full Content View */}
              {selectedItem.type === "new" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-header">Proposed Term Details</CardTitle>
                    <CardDescription>All fields submitted for review</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div data-testid="section-definition">
                      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Definition</h4>
                      <p className="text-kat-charcoal">{selectedItem.definition}</p>
                    </div>

                    {selectedItem.whyExists && (
                      <div data-testid="section-why-exists">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Why This Term Exists</h4>
                        <p className="text-kat-charcoal">{selectedItem.whyExists}</p>
                      </div>
                    )}

                    {selectedItem.usedWhen && (
                      <div data-testid="section-used-when">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Used When</h4>
                        <p className="text-kat-charcoal">{selectedItem.usedWhen}</p>
                      </div>
                    )}

                    {selectedItem.notUsedWhen && (
                      <div data-testid="section-not-used-when">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Not Used When</h4>
                        <p className="text-kat-charcoal">{selectedItem.notUsedWhen}</p>
                      </div>
                    )}

                    {selectedItem.examplesGood && selectedItem.examplesGood.length > 0 && (
                      <div data-testid="section-good-examples">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Good Examples</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedItem.examplesGood.map((ex, i) => (
                            <li key={i} className="text-kat-charcoal text-sm">{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.examplesBad && selectedItem.examplesBad.length > 0 && (
                      <div data-testid="section-bad-examples">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Bad Examples</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedItem.examplesBad.map((ex, i) => (
                            <li key={i} className="text-kat-charcoal text-sm">{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.synonyms && selectedItem.synonyms.length > 0 && (
                      <div data-testid="section-synonyms">
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">Synonyms</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.synonyms.map((syn, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">{syn}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Submitter Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-header">Submission Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedItem.submittedBy.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-kat-black">{selectedItem.submittedBy}</p>
                      <p className="text-sm text-muted-foreground">Submitted {formatDate(selectedItem.submittedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              {(() => {
                const events = proposalDetail?.events || [];
                // Fallback: if no events, show derived "Submitted" event
                const displayEvents = events.length > 0 ? events : [{
                  id: "fallback",
                  proposalId: selectedItem.id,
                  eventType: "submitted" as const,
                  actorId: selectedItem.submittedBy,
                  comment: null,
                  timestamp: selectedItem.submittedAt,
                }];

                const eventStyles: Record<string, { icon: string; color: string; label: string }> = {
                  submitted: { icon: "blue", color: "text-blue-600 bg-blue-100 border-blue-300", label: "Submitted" },
                  changes_requested: { icon: "amber", color: "text-amber-600 bg-amber-100 border-amber-300", label: "Changes requested" },
                  resubmitted: { icon: "blue", color: "text-blue-600 bg-blue-100 border-blue-300", label: "Resubmitted" },
                  approved: { icon: "green", color: "text-green-600 bg-green-100 border-green-300", label: "Approved" },
                  rejected: { icon: "red", color: "text-red-600 bg-red-100 border-red-300", label: "Rejected" },
                  withdrawn: { icon: "gray", color: "text-gray-600 bg-gray-100 border-gray-300", label: "Withdrawn" },
                };

                return (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-header">Audit Trail</CardTitle>
                      <CardDescription>History of actions on this proposal</CardDescription>
                    </CardHeader>
                    <CardContent data-testid="audit-trail-section">
                      <div className="relative">
                        {/* Vertical timeline line */}
                        {displayEvents.length > 1 && (
                          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />
                        )}
                        <div className="space-y-4">
                          {displayEvents.map((event, index) => {
                            const style = eventStyles[event.eventType] || eventStyles.submitted;
                            return (
                              <div key={event.id} className="flex gap-3 relative" data-testid={`audit-event-${index}`}>
                                <div className={cn("h-6 w-6 rounded-full border flex-shrink-0 z-10 flex items-center justify-center", style.color)}>
                                  <div className="h-2 w-2 rounded-full bg-current" />
                                </div>
                                <div className="flex-1 min-w-0 pb-1">
                                  <p className="text-sm font-medium text-kat-charcoal">
                                    {style.label} by {event.actorId}
                                  </p>
                                  <p className="text-xs text-muted-foreground" title={formatAbsoluteDate(event.timestamp)}>
                                    {formatDate(event.timestamp)}
                                  </p>
                                  {event.comment && (
                                    <p className="text-sm text-muted-foreground mt-1 italic">
                                      "{event.comment}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Review Actions */}
              {selectedItem.status !== 'approved' && selectedItem.status !== 'rejected' && (
                <Card className="border-primary/20 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-header">Review Actions</CardTitle>
                    <CardDescription>Add a comment and take action on this proposal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add a review comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="review-comment-textarea"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                        onClick={() => setApproveDialogOpen(true)}
                        disabled={isPending}
                        data-testid="approve-button"
                      >
                        {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-kat-warning text-yellow-800 hover:bg-kat-warning/10 font-bold gap-2"
                        onClick={() => {
                          if (!comment.trim()) {
                            toast({ title: "Feedback required", description: "Please add feedback explaining what changes are needed.", variant: "destructive" });
                            return;
                          }
                          requestChangesMutation.mutate({ id: selectedItem.id, comment });
                        }}
                        disabled={isPending}
                        data-testid="request-changes-button"
                      >
                        {requestChangesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        Request Changes
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-bold gap-2"
                        onClick={() => {
                          if (!comment.trim()) {
                            toast({ title: "Reason required", description: "Please add a reason for rejecting this proposal.", variant: "destructive" });
                            return;
                          }
                          rejectMutation.mutate({ id: selectedItem.id, comment });
                        }}
                        disabled={isPending}
                        data-testid="reject-button"
                      >
                        {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Approval Confirmation Dialog — Enter does NOT confirm (AR15) */}
              <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent data-testid="approval-confirmation-dialog" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve this proposal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will {selectedItem?.type === "edit" ? "update the existing term with the proposed changes" : "create a new canonical term"}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel ref={cancelRef} autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (selectedItem) {
                          approveMutation.mutate({ id: selectedItem.id, comment });
                        }
                      }}
                      data-testid="confirm-approve-button"
                    >
                      Confirm Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {(selectedItem.status === 'approved' || selectedItem.status === 'rejected') && (
                <Card className="border-muted bg-muted/20">
                  <CardContent className="py-6 text-center">
                    <StatusBadge status={selectedItem.status} />
                    <p className="text-muted-foreground mt-2">This proposal has been {selectedItem.status}.</p>
                    {selectedItem.reviewComment && (
                      <p className="mt-4 text-sm italic text-muted-foreground">"{selectedItem.reviewComment}"</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground/40" />
              <p>Select a proposal from the queue to review</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
