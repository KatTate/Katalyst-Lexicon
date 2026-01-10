import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, XCircle, MessageSquare, Clock, Eye, 
  ChevronRight, ArrowRight, User, Loader2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { api, Proposal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ReviewQueue() {
  const [selectedItem, setSelectedItem] = useState<Proposal | null>(null);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allProposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const proposals = activeTab === "all" 
    ? allProposals
    : allProposals.filter(p => {
        if (activeTab === "pending") return p.status === "pending";
        if (activeTab === "review") return p.status === "in_review";
        if (activeTab === "changes") return p.status === "changes_requested";
        return true;
      });

  const pendingCount = allProposals.filter(i => i.status === 'pending').length;
  const inReviewCount = allProposals.filter(i => i.status === 'in_review').length;
  const changesCount = allProposals.filter(i => i.status === 'changes_requested').length;

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.approve(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/terms"] });
      toast({ title: "Approved", description: "The proposal has been approved and the term is now canonical." });
      setSelectedItem(null);
      setComment("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve proposal.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.reject(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Rejected", description: "The proposal has been rejected." });
      setSelectedItem(null);
      setComment("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject proposal.", variant: "destructive" });
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.proposals.requestChanges(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Changes Requested", description: "The submitter has been notified to make changes." });
      setSelectedItem(null);
      setComment("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to request changes.", variant: "destructive" });
    },
  });

  const StatusBadge = ({ status }: { status: Proposal['status'] }) => {
    const styles: Record<string, string> = {
      'pending': "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
      'in_review': "bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30",
      'changes_requested': "bg-destructive/10 text-destructive border-destructive/20",
      'approved': "bg-primary/10 text-primary border-primary/20",
      'rejected': "bg-muted text-muted-foreground border-border",
    };
    const labels: Record<string, string> = {
      'pending': "Pending",
      'in_review': "In Review",
      'changes_requested': "Changes Requested",
      'approved': "Approved",
      'rejected': "Rejected",
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

  const isPending = approveMutation.isPending || rejectMutation.isPending || requestChangesMutation.isPending;

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
                <p className="text-sm text-muted-foreground text-center py-8">No proposals in this category</p>
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
                    data-testid={`proposal-item-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold uppercase",
                          item.type === 'new' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {item.type}
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
                      selectedItem.type === 'new' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
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
                      View Full Term
                    </Button>
                  </Link>
                )}
              </div>

              {/* Changes Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-header">Changes Summary</CardTitle>
                  <CardDescription>What's being proposed</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-kat-charcoal">{selectedItem.changesSummary}</p>
                  
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <h4 className="font-bold text-sm mb-3">Proposed Definition</h4>
                    <p className="text-kat-charcoal">{selectedItem.definition}</p>
                  </div>

                  {selectedItem.type === 'edit' && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Field-by-Field Changes
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50/50 rounded border-l-4 border-primary">
                            <p className="text-xs font-bold text-muted-foreground mb-1">NEW DEFINITION</p>
                            <p className="text-kat-charcoal">{selectedItem.definition}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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

              {/* Review Actions */}
              {selectedItem.status !== 'approved' && selectedItem.status !== 'rejected' && (
                <Card className="border-primary/20 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-header">Review Actions</CardTitle>
                    <CardDescription>Add a comment and take action on this proposal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Add a review comment (optional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="input-review-comment"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                        onClick={() => approveMutation.mutate({ id: selectedItem.id, comment })}
                        disabled={isPending}
                        data-testid="button-approve"
                      >
                        {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve & Publish
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-kat-warning text-yellow-800 hover:bg-kat-warning/10 font-bold gap-2"
                        onClick={() => requestChangesMutation.mutate({ id: selectedItem.id, comment })}
                        disabled={isPending}
                        data-testid="button-request-changes"
                      >
                        {requestChangesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        Request Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-bold gap-2"
                        onClick={() => rejectMutation.mutate({ id: selectedItem.id, comment })}
                        disabled={isPending}
                        data-testid="button-reject"
                      >
                        {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select an item from the queue to review
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
