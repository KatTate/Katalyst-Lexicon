import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, XCircle, MessageSquare, Clock, Eye, 
  ChevronRight, AlertTriangle, ArrowRight, User
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface ReviewItem {
  id: string;
  termName: string;
  category: string;
  type: 'new' | 'edit';
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'in_review' | 'changes_requested';
  assignedTo?: string;
  changesSummary?: string;
}

const MOCK_QUEUE: ReviewItem[] = [
  {
    id: "r1",
    termName: "Phase Gate",
    category: "Planning & Execution",
    type: "new",
    submittedBy: "Mike Ross",
    submittedAt: "2 hours ago",
    status: "pending",
    changesSummary: "New term proposal for defining milestone checkpoints in project lifecycle."
  },
  {
    id: "r2",
    termName: "Condition of Satisfaction (CoS)",
    category: "Planning & Execution",
    type: "edit",
    submittedBy: "Rachel Zane",
    submittedAt: "1 day ago",
    status: "in_review",
    assignedTo: "Sarah Jenkins",
    changesSummary: "Updated examples section and added new exclusion rules."
  },
  {
    id: "r3",
    termName: "Client Success Metric",
    category: "Commercial",
    type: "new",
    submittedBy: "Harvey Specter",
    submittedAt: "3 days ago",
    status: "changes_requested",
    assignedTo: "Sarah Jenkins",
    changesSummary: "Definition needs to differentiate from 'KPI' more clearly."
  },
];

export default function ReviewQueue() {
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(MOCK_QUEUE[0]);
  const [comment, setComment] = useState("");

  const pendingCount = MOCK_QUEUE.filter(i => i.status === 'pending').length;
  const inReviewCount = MOCK_QUEUE.filter(i => i.status === 'in_review').length;
  const changesCount = MOCK_QUEUE.filter(i => i.status === 'changes_requested').length;

  const StatusBadge = ({ status }: { status: ReviewItem['status'] }) => {
    const styles = {
      'pending': "bg-kat-warning/20 text-yellow-800 border-kat-warning/30",
      'in_review': "bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30",
      'changes_requested': "bg-destructive/10 text-destructive border-destructive/20",
    };
    const labels = {
      'pending': "Pending",
      'in_review': "In Review",
      'changes_requested': "Changes Requested",
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wide", styles[status])}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-screen">
        
        {/* Left Panel - Queue List */}
        <div className="w-full lg:w-[400px] border-r border-border bg-white flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-header font-bold text-kat-black">Review Queue</h1>
            <p className="text-sm text-muted-foreground mt-1">Approve or request changes on proposed terms</p>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 grid grid-cols-4 bg-muted/50">
              <TabsTrigger value="all" className="text-xs">All ({MOCK_QUEUE.length})</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="review" className="text-xs">Review ({inReviewCount})</TabsTrigger>
              <TabsTrigger value="changes" className="text-xs">Changes ({changesCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-y-auto p-4 space-y-2 m-0">
              {MOCK_QUEUE.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                    selectedItem?.id === item.id 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border bg-white hover:border-primary/50"
                  )}
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
                      {item.submittedAt}
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="pending" className="flex-1 overflow-y-auto p-4 m-0">
              <p className="text-sm text-muted-foreground text-center py-8">Filter: Pending items only</p>
            </TabsContent>
            <TabsContent value="review" className="flex-1 overflow-y-auto p-4 m-0">
              <p className="text-sm text-muted-foreground text-center py-8">Filter: In Review items only</p>
            </TabsContent>
            <TabsContent value="changes" className="flex-1 overflow-y-auto p-4 m-0">
              <p className="text-sm text-muted-foreground text-center py-8">Filter: Changes Requested items only</p>
            </TabsContent>
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
                  <h2 className="text-3xl font-header font-bold text-kat-black">{selectedItem.termName}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.category}</p>
                </div>
                <Link href={`/term/1`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Full Term
                  </Button>
                </Link>
              </div>

              {/* Changes Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-header">Changes Summary</CardTitle>
                  <CardDescription>What's being proposed</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-kat-charcoal">{selectedItem.changesSummary}</p>
                  
                  {selectedItem.type === 'edit' && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Field-by-Field Diff
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50/50 rounded border-l-4 border-destructive">
                            <p className="text-xs font-bold text-muted-foreground mb-1">REMOVED</p>
                            <p className="line-through text-muted-foreground">"The client is satisfied."</p>
                          </div>
                          <div className="p-3 bg-green-50/50 rounded border-l-4 border-primary">
                            <p className="text-xs font-bold text-muted-foreground mb-1">ADDED</p>
                            <p className="text-kat-charcoal">"Client approves the wireframe deck via email."</p>
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
                      <p className="text-sm text-muted-foreground">Submitted {selectedItem.submittedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Actions */}
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
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Publish
                    </Button>
                    <Button variant="outline" className="flex-1 border-kat-warning text-yellow-800 hover:bg-kat-warning/10 font-bold gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Request Changes
                    </Button>
                    <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-bold gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
