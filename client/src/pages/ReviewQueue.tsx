import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2, XCircle, MessageSquare, Clock, Eye,
  ChevronRight, User, Loader2, ClipboardCheck, Pencil, RotateCcw, Plus, X
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { api, Proposal, ProposalEvent, Term, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { canReview as checkCanReview } from "@shared/permissions";

interface ReviewerEdits {
  termName: string;
  category: string;
  definition: string;
  whyExists: string;
  usedWhen: string;
  notUsedWhen: string;
  examplesGood: string[];
  examplesBad: string[];
  synonyms: string[];
}

function useReviewerEdits(proposal: Proposal | null) {
  const [edits, setEdits] = useState<ReviewerEdits | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (proposal) {
      setEdits({
        termName: proposal.termName,
        category: proposal.category,
        definition: proposal.definition,
        whyExists: proposal.whyExists,
        usedWhen: proposal.usedWhen,
        notUsedWhen: proposal.notUsedWhen,
        examplesGood: [...(proposal.examplesGood || [])],
        examplesBad: [...(proposal.examplesBad || [])],
        synonyms: [...(proposal.synonyms || [])],
      });
      setIsEditing(false);
    } else {
      setEdits(null);
      setIsEditing(false);
    }
  }, [proposal?.id]);

  const hasChanges = useMemo(() => {
    if (!edits || !proposal) return false;
    return (
      edits.termName !== proposal.termName ||
      edits.category !== proposal.category ||
      edits.definition !== proposal.definition ||
      edits.whyExists !== proposal.whyExists ||
      edits.usedWhen !== proposal.usedWhen ||
      edits.notUsedWhen !== proposal.notUsedWhen ||
      JSON.stringify(edits.examplesGood) !== JSON.stringify(proposal.examplesGood || []) ||
      JSON.stringify(edits.examplesBad) !== JSON.stringify(proposal.examplesBad || []) ||
      JSON.stringify(edits.synonyms) !== JSON.stringify(proposal.synonyms || [])
    );
  }, [edits, proposal]);

  const changedFields = useMemo(() => {
    if (!edits || !proposal) return [];
    const fields: string[] = [];
    if (edits.termName !== proposal.termName) fields.push("Term Name");
    if (edits.category !== proposal.category) fields.push("Category");
    if (edits.definition !== proposal.definition) fields.push("Definition");
    if (edits.whyExists !== proposal.whyExists) fields.push("Why It Exists");
    if (edits.usedWhen !== proposal.usedWhen) fields.push("Used When");
    if (edits.notUsedWhen !== proposal.notUsedWhen) fields.push("Not Used When");
    if (JSON.stringify(edits.examplesGood) !== JSON.stringify(proposal.examplesGood || [])) fields.push("Good Examples");
    if (JSON.stringify(edits.examplesBad) !== JSON.stringify(proposal.examplesBad || [])) fields.push("Bad Examples");
    if (JSON.stringify(edits.synonyms) !== JSON.stringify(proposal.synonyms || [])) fields.push("Synonyms");
    return fields;
  }, [edits, proposal]);

  const resetEdits = useCallback(() => {
    if (proposal) {
      setEdits({
        termName: proposal.termName,
        category: proposal.category,
        definition: proposal.definition,
        whyExists: proposal.whyExists,
        usedWhen: proposal.usedWhen,
        notUsedWhen: proposal.notUsedWhen,
        examplesGood: [...(proposal.examplesGood || [])],
        examplesBad: [...(proposal.examplesBad || [])],
        synonyms: [...(proposal.synonyms || [])],
      });
    }
  }, [proposal]);

  const updateField = useCallback((field: keyof ReviewerEdits, value: any) => {
    setEdits((prev) => prev ? { ...prev, [field]: value } : prev);
  }, []);

  return { edits, isEditing, setIsEditing, hasChanges, changedFields, resetEdits, updateField };
}

function EditableTextField({
  label,
  value,
  originalValue,
  onChange,
  isEditing,
  multiline,
  testId,
}: {
  label: string;
  value: string;
  originalValue: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  testId: string;
}) {
  const changed = value !== originalValue;
  return (
    <div data-testid={testId} className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
        {changed && <Badge variant="outline" className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">Edited</Badge>}
      </div>
      {isEditing ? (
        multiline ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("min-h-[80px]", changed && "border-amber-400 dark:border-amber-600")}
            data-testid={`${testId}-input`}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(changed && "border-amber-400 dark:border-amber-600")}
            data-testid={`${testId}-input`}
          />
        )
      ) : (
        <p className="text-foreground/80 text-sm">{value || <span className="italic text-muted-foreground">empty</span>}</p>
      )}
    </div>
  );
}

function EditableArrayField({
  label,
  values,
  originalValues,
  onChange,
  isEditing,
  testId,
}: {
  label: string;
  values: string[];
  originalValues: string[];
  onChange: (v: string[]) => void;
  isEditing: boolean;
  testId: string;
}) {
  const changed = JSON.stringify(values) !== JSON.stringify(originalValues);

  const addItem = () => onChange([...values, ""]);
  const removeItem = (index: number) => onChange(values.filter((_, i) => i !== index));
  const updateItem = (index: number, val: string) => {
    const updated = [...values];
    updated[index] = val;
    onChange(updated);
  };

  if (!isEditing && values.length === 0) return null;

  return (
    <div data-testid={testId} className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
        {changed && <Badge variant="outline" className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">Edited</Badge>}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          {values.map((val, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={val}
                onChange={(e) => updateItem(i, e.target.value)}
                className={cn("flex-1", changed && "border-amber-400 dark:border-amber-600")}
                data-testid={`${testId}-input-${i}`}
              />
              <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="shrink-0 text-muted-foreground hover:text-destructive" data-testid={`${testId}-remove-${i}`}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs" data-testid={`${testId}-add`}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      ) : label === "Synonyms" ? (
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-sm">{v}</Badge>
          ))}
        </div>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {values.map((v, i) => (
            <li key={i} className="text-foreground/80 text-sm">{v}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiffField({ label, oldValue, newValue, testId }: { label: string; oldValue: string; newValue: string; testId: string }) {
  const changed = oldValue !== newValue;
  if (!changed && !newValue) return null;
  
  return (
    <div data-testid={testId} className="space-y-1">
      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
      {changed ? (
        <div className="space-y-2">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-900 dark:text-red-300">
            <span className="font-bold text-red-600 dark:text-red-400 text-xs uppercase mr-2">Current:</span>
            {oldValue || <span className="italic text-muted-foreground">empty</span>}
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-3 text-sm text-green-900 dark:text-green-300">
            <span className="font-bold text-green-600 dark:text-green-400 text-xs uppercase mr-2">Proposed:</span>
            {newValue || <span className="italic text-muted-foreground">empty</span>}
          </div>
        </div>
      ) : (
        <p className="text-foreground/80 text-sm">{newValue}</p>
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
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3">
              <span className="font-bold text-red-600 dark:text-red-400 text-xs uppercase mr-2">Removed:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {removed.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 line-through">{v}</Badge>
                ))}
              </div>
            </div>
          )}
          {added.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-3">
              <span className="font-bold text-green-600 dark:text-green-400 text-xs uppercase mr-2">Added:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {added.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-green-300 dark:border-green-700 text-green-800 dark:text-green-300">{v}</Badge>
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

export default function ReviewQueue() {
  const [selectedItem, setSelectedItem] = useState<Proposal | null>(null);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const canReview = isAuthenticated && user?.role ? checkCanReview(user.role) : false;

  const { edits, isEditing, setIsEditing, hasChanges, changedFields, resetEdits, updateField } = useReviewerEdits(selectedItem);

  useEffect(() => {
    document.title = "Review Queue — Katalyst Lexicon";
  }, []);

  const { data: allProposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    enabled: canReview,
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: canReview,
  });

  const { data: originalTerm } = useQuery<Term>({
    queryKey: ["/api/terms", selectedItem?.termId],
    queryFn: () => api.terms.get(selectedItem?.termId || ""),
    enabled: canReview && !!selectedItem?.termId && selectedItem?.type === "edit",
  });

  const { data: proposalDetail } = useQuery<Proposal & { events?: ProposalEvent[] }>({
    queryKey: ["/api/proposals", selectedItem?.id],
    queryFn: () => api.proposals.get(selectedItem?.id || ""),
    enabled: canReview && !!selectedItem?.id,
  });

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handle409Error = (error: unknown) => {
    const is409 = error instanceof Error && error.message?.includes("409");
    if (is409) {
      toast({ title: "Already reviewed", description: "This proposal has already been reviewed", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      setSelectedItem(null);
    }
    return is409;
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, comment, edits }: { id: string; comment?: string; edits?: Partial<ReviewerEdits> }) =>
      api.proposals.approve(id, comment, edits),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      const msg = data.approvedWithEdits
        ? "Proposal approved with reviewer edits — term has been published"
        : "Proposal approved — term has been published";
      toast({ title: data.approvedWithEdits ? "Approved with edits" : "Proposal approved", description: msg });
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

  if (!canReview) {
    return (
      <Layout>
        <div className="p-8 max-w-2xl mx-auto text-center" data-testid="permission-denied-review">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-header font-bold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to review proposals.</p>
        </div>
      </Layout>
    );
  }

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

  const StatusBadge = ({ status }: { status: Proposal['status'] }) => {
    const styles: Record<string, string> = {
      'pending': "bg-kat-warning/20 text-yellow-800 dark:text-yellow-300 border-kat-warning/30",
      'in_review': "bg-kat-mystical/20 text-foreground border-kat-mystical/30",
      'changes_requested': "bg-destructive/10 text-destructive border-destructive/20",
      'approved': "bg-primary/10 text-primary border-primary/20",
      'rejected': "bg-muted text-muted-foreground border-border",
      'withdrawn': "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600",
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
  const canEdit = selectedItem && selectedItem.status !== 'approved' && selectedItem.status !== 'rejected';

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-screen">
        
        {/* Left Panel - Queue List */}
        <div className="w-full lg:w-[400px] border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-header font-bold text-foreground">Review Queue</h1>
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
                    onClick={() => { setSelectedItem(item); setIsEditing(false); }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      selectedItem?.id === item.id 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border bg-card hover:border-primary/50"
                    )}
                    data-testid={`proposal-card-${item.id}`}
                    aria-label={`${item.type === 'new' ? 'New' : 'Edit'} proposal: ${item.termName}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold uppercase",
                          item.type === 'new' ? "bg-primary/10 text-primary" : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                        )}>
                          {item.type === 'new' ? 'New' : 'Edit'}
                        </Badge>
                        <StatusBadge status={item.status} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-header font-bold text-foreground mb-1">{item.termName}</h3>
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
          {selectedItem && edits ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-xs font-bold uppercase",
                      selectedItem.type === 'new' ? "bg-primary/10 text-primary" : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    )}>
                      {selectedItem.type === 'new' ? 'New Term Proposal' : 'Edit Proposal'}
                    </Badge>
                    <StatusBadge status={selectedItem.status} />
                    {hasChanges && (
                      <Badge variant="outline" className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                        {changedFields.length} field{changedFields.length !== 1 ? 's' : ''} edited
                      </Badge>
                    )}
                  </div>
                  {isEditing ? (
                    <Input
                      value={edits.termName}
                      onChange={(e) => updateField("termName", e.target.value)}
                      className={cn("text-2xl font-header font-bold h-auto py-1", edits.termName !== selectedItem.termName && "border-amber-400 dark:border-amber-600")}
                      data-testid="edit-term-name"
                    />
                  ) : (
                    <h2 className="text-3xl font-header font-bold text-foreground" data-testid="text-proposal-name">
                      {edits.termName}
                      {edits.termName !== selectedItem.termName && (
                        <Badge variant="outline" className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 align-middle">Edited</Badge>
                      )}
                    </h2>
                  )}
                  {isEditing ? (
                    <Select value={edits.category} onValueChange={(v) => updateField("category", v)}>
                      <SelectTrigger className={cn("w-64", edits.category !== selectedItem.category && "border-amber-400 dark:border-amber-600")} data-testid="edit-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{edits.category}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <>
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => { resetEdits(); setIsEditing(false); }} data-testid="cancel-edit-button">
                            <RotateCcw className="h-4 w-4" />
                            Cancel Edits
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)} data-testid="edit-fields-button">
                          <Pencil className="h-4 w-4" />
                          Edit Fields
                        </Button>
                      )}
                    </>
                  )}
                  {selectedItem.termId && (
                    <Link href={`/term/${selectedItem.termId}`}>
                      <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-term">
                        <Eye className="h-4 w-4" />
                        View Current Term
                      </Button>
                    </Link>
                  )}
                </div>
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
                  <p className="text-foreground/80" data-testid="text-changes-summary">{selectedItem.changesSummary}</p>
                </CardContent>
              </Card>

              {/* Edit Proposal: Diff View */}
              {isEditProposal && !isEditing && (
                <Card className="mb-6 border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-header">Proposed Changes</CardTitle>
                    <CardDescription>Comparing current term with proposed edits. Changed fields are highlighted.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DiffField label="Category" oldValue={originalTerm.category} newValue={edits.category} testId="diff-category" />
                    <DiffField label="Definition" oldValue={originalTerm.definition} newValue={edits.definition} testId="diff-definition" />
                    <DiffField label="Why This Term Exists" oldValue={originalTerm.whyExists} newValue={edits.whyExists} testId="diff-why-exists" />
                    <DiffField label="Used When" oldValue={originalTerm.usedWhen} newValue={edits.usedWhen} testId="diff-used-when" />
                    <DiffField label="Not Used When" oldValue={originalTerm.notUsedWhen} newValue={edits.notUsedWhen} testId="diff-not-used-when" />
                    <DiffArrayField label="Good Examples" oldValue={originalTerm.examplesGood} newValue={edits.examplesGood} testId="diff-good-examples" />
                    <DiffArrayField label="Bad Examples" oldValue={originalTerm.examplesBad} newValue={edits.examplesBad} testId="diff-bad-examples" />
                    <DiffArrayField label="Synonyms" oldValue={originalTerm.synonyms} newValue={edits.synonyms} testId="diff-synonyms" />
                  </CardContent>
                </Card>
              )}

              {/* Editable Term Details (new proposals or editing mode) */}
              {(selectedItem.type === "new" || isEditing) && (
                <Card className={cn("mb-6", isEditing && "border-amber-200 dark:border-amber-700")}>
                  <CardHeader>
                    <CardTitle className="text-lg font-header">
                      {isEditing ? "Edit Term Details" : "Proposed Term Details"}
                    </CardTitle>
                    <CardDescription>
                      {isEditing ? "Make any changes needed before approving" : "All fields submitted for review"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <EditableTextField
                      label="Definition"
                      value={edits.definition}
                      originalValue={selectedItem.definition}
                      onChange={(v) => updateField("definition", v)}
                      isEditing={isEditing}
                      multiline
                      testId="section-definition"
                    />
                    <EditableTextField
                      label="Why This Term Exists"
                      value={edits.whyExists}
                      originalValue={selectedItem.whyExists}
                      onChange={(v) => updateField("whyExists", v)}
                      isEditing={isEditing}
                      multiline
                      testId="section-why-exists"
                    />
                    <EditableTextField
                      label="Used When"
                      value={edits.usedWhen}
                      originalValue={selectedItem.usedWhen}
                      onChange={(v) => updateField("usedWhen", v)}
                      isEditing={isEditing}
                      multiline
                      testId="section-used-when"
                    />
                    <EditableTextField
                      label="Not Used When"
                      value={edits.notUsedWhen}
                      originalValue={selectedItem.notUsedWhen}
                      onChange={(v) => updateField("notUsedWhen", v)}
                      isEditing={isEditing}
                      multiline
                      testId="section-not-used-when"
                    />
                    <EditableArrayField
                      label="Good Examples"
                      values={edits.examplesGood}
                      originalValues={selectedItem.examplesGood || []}
                      onChange={(v) => updateField("examplesGood", v)}
                      isEditing={isEditing}
                      testId="section-good-examples"
                    />
                    <EditableArrayField
                      label="Bad Examples"
                      values={edits.examplesBad}
                      originalValues={selectedItem.examplesBad || []}
                      onChange={(v) => updateField("examplesBad", v)}
                      isEditing={isEditing}
                      testId="section-bad-examples"
                    />
                    <EditableArrayField
                      label="Synonyms"
                      values={edits.synonyms}
                      originalValues={selectedItem.synonyms || []}
                      onChange={(v) => updateField("synonyms", v)}
                      isEditing={isEditing}
                      testId="section-synonyms"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Reviewer edits summary banner */}
              {hasChanges && (
                <Card className="mb-6 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                          You've edited {changedFields.length} field{changedFields.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          Changed: {changedFields.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          The Approve button will record these as "Approved with Edits" in the audit trail.
                        </p>
                      </div>
                    </div>
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
                      <p className="font-bold text-foreground">{selectedItem.submittedBy}</p>
                      <p className="text-sm text-muted-foreground">Submitted {formatDate(selectedItem.submittedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              {(() => {
                const events = proposalDetail?.events || [];
                const displayEvents = events.length > 0 ? events : [{
                  id: "fallback",
                  proposalId: selectedItem.id,
                  eventType: "submitted" as const,
                  actorId: selectedItem.submittedBy,
                  comment: null,
                  timestamp: selectedItem.submittedAt,
                }];

                const eventStyles: Record<string, { icon: string; color: string; label: string }> = {
                  submitted: { icon: "blue", color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700", label: "Submitted" },
                  changes_requested: { icon: "amber", color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700", label: "Changes requested" },
                  resubmitted: { icon: "blue", color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700", label: "Resubmitted" },
                  approved: { icon: "green", color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700", label: "Approved" },
                  rejected: { icon: "red", color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700", label: "Rejected" },
                  withdrawn: { icon: "gray", color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600", label: "Withdrawn" },
                };

                return (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-header">Audit Trail</CardTitle>
                      <CardDescription>History of actions on this proposal</CardDescription>
                    </CardHeader>
                    <CardContent data-testid="audit-trail-section">
                      <div className="relative">
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
                                  <p className="text-sm font-medium text-foreground/80">
                                    {style.label} by {event.actorId}
                                  </p>
                                  <p className="text-xs text-muted-foreground" title={formatAbsoluteDate(event.timestamp)}>
                                    {formatDate(event.timestamp)}
                                  </p>
                                  {event.comment && (
                                    <p className="text-sm text-muted-foreground mt-1 italic whitespace-pre-line">
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
                <Card className="border-primary/20 bg-card shadow-sm">
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
                        className={cn(
                          "flex-1 font-bold gap-2 text-white",
                          hasChanges
                            ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                            : "bg-primary hover:bg-primary/90"
                        )}
                        onClick={() => setApproveDialogOpen(true)}
                        disabled={isPending}
                        data-testid="approve-button"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hasChanges ? (
                          <Pencil className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {hasChanges ? "Approve with Edits" : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-kat-warning text-yellow-800 dark:text-yellow-300 hover:bg-kat-warning/10 font-bold gap-2"
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

              {/* Approval Confirmation Dialog */}
              <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent data-testid="approval-confirmation-dialog" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {hasChanges ? "Approve with edits?" : "Approve this proposal?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {hasChanges ? (
                        <>
                          This will create a new canonical term with your edits applied. The following fields were modified: {changedFields.join(", ")}.
                          {" "}Your edits will be recorded in the audit trail.
                        </>
                      ) : (
                        <>
                          This will {selectedItem?.type === "edit" ? "update the existing term with the proposed changes" : "create a new canonical term"}. This action cannot be undone.
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel ref={cancelRef} autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className={cn(hasChanges ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90")}
                      onClick={() => {
                        if (selectedItem) {
                          const editsToSend = hasChanges ? edits : undefined;
                          approveMutation.mutate({ id: selectedItem.id, comment, edits: editsToSend || undefined });
                        }
                      }}
                      data-testid="confirm-approve-button"
                    >
                      {hasChanges ? "Confirm Approve with Edits" : "Confirm Approve"}
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
