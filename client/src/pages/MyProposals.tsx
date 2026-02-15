import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, FileEdit, FilePlus, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { api, Proposal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

function getUserDisplayName(user: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  if (!user) return "";
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.email || "";
}

export default function MyProposals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "My Proposals — Katalyst Lexicon";
  }, []);

  const { data: allProposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    enabled: isAuthenticated,
  });

  const currentUserName = getUserDisplayName(user);
  const myProposals = allProposals
    .filter(p => p.submittedBy === currentUserName)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => api.proposals.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({ title: "Proposal withdrawn", description: "Your proposal has been withdrawn." });
      setWithdrawId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to withdraw proposal.", variant: "destructive" });
      setWithdrawId(null);
    },
  });

  const statusStyles: Record<string, string> = {
    pending: "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
    in_review: "bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30",
    changes_requested: "bg-amber-100 text-amber-800 border-amber-300",
    approved: "bg-primary/10 text-primary border-primary/20",
    rejected: "bg-muted text-muted-foreground border-border",
    withdrawn: "bg-gray-100 text-gray-600 border-gray-300",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending Review",
    in_review: "In Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-header font-bold text-kat-black">My Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track the status of your submitted proposals</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : myProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-my-proposals">
            <FileEdit className="h-12 w-12 text-primary/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">You haven't submitted any proposals yet.</p>
            <Link href="/propose">
              <Button className="gap-2" data-testid="propose-term-cta">
                <FilePlus className="h-4 w-4" />
                Propose a Term
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myProposals.map(proposal => (
              <Card
                key={proposal.id}
                className={cn(
                  "transition-all hover:shadow-sm",
                  proposal.status === "changes_requested" && "border-amber-300 bg-amber-50/30"
                )}
                data-testid={`my-proposal-${proposal.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", proposal.type === 'new' ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800 border-amber-300")}>
                          {proposal.type === 'new' ? 'New' : 'Edit'}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wide", statusStyles[proposal.status])}>
                          {statusLabels[proposal.status] || proposal.status}
                        </Badge>
                      </div>
                      <h3 className="font-header font-bold text-kat-black">{proposal.termName}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{proposal.category}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(proposal.submittedAt)}
                      </div>

                      {/* Show reviewer feedback for changes_requested */}
                      {proposal.status === "changes_requested" && proposal.reviewComment && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm" data-testid="feedback-banner">
                          <p className="font-bold text-amber-800 text-xs uppercase mb-1">Reviewer feedback</p>
                          <p className="text-amber-900">{proposal.reviewComment}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {proposal.status === "changes_requested" && (
                        <Link href={`/propose?reviseProposalId=${proposal.id}`}>
                          <Button size="sm" className="gap-1" data-testid="revise-button">
                            <FileEdit className="h-3 w-3" />
                            Revise
                          </Button>
                        </Link>
                      )}
                      {(proposal.status === "pending" || proposal.status === "changes_requested") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setWithdrawId(proposal.id)}
                          data-testid="withdraw-button"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      {(proposal.status === "approved" || proposal.status === "rejected") && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={!!withdrawId} onOpenChange={(open) => { if (!open) setWithdrawId(null); }}>
        <AlertDialogContent data-testid="withdraw-confirmation-dialog" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The proposal will be permanently removed from the review queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => { if (withdrawId) withdrawMutation.mutate(withdrawId); }}
            >
              {withdrawMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
