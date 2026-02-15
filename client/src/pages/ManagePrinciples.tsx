import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit2, Archive, Loader2, ShieldAlert,
  BookOpen, Search, X, LinkIcon, Calendar
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { api, Principle, Term } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { canAdmin } from "@shared/permissions";
import { PrincipleStatusBadge } from "@/components/PrincipleStatusBadge";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface PrincipleWithCount extends Principle {
  linkedTermCount?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  status: "Draft" as "Draft" | "Published",
  visibility: "Internal" as "Internal" | "Client-Safe" | "Public",
  tags: "",
};

function TermLinker({ principleId }: { principleId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: linkedTerms = [] } = useQuery<Term[]>({
    queryKey: [`/api/principles/${principleId}/terms`],
    queryFn: () => api.principles.getTerms(principleId),
    enabled: !!principleId,
  });

  const { data: searchResults = [] } = useQuery<Term[]>({
    queryKey: [`/api/terms/search?q=${searchQuery}`],
    queryFn: () => api.terms.search(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const linkMutation = useMutation({
    mutationFn: (termId: string) => api.principles.linkTerm(principleId, termId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/principles/${principleId}/terms`] });
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      setSearchQuery("");
      setShowDropdown(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to link term.", variant: "destructive" });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (termId: string) => api.principles.unlinkTerm(principleId, termId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/principles/${principleId}/terms`] });
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unlink term.", variant: "destructive" });
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkedTermIds = new Set(linkedTerms.map(t => t.id));
  const filteredResults = searchResults.filter(t => !linkedTermIds.has(t.id));

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <LinkIcon className="h-4 w-4" />
        Related Terms
      </Label>

      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms to link..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(e.target.value.length >= 2);
            }}
            onFocus={() => {
              if (searchQuery.length >= 2) setShowDropdown(true);
            }}
            className="pl-9"
            data-testid="input-term-search"
          />
        </div>

        {showDropdown && filteredResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredResults.map(term => (
              <button
                key={term.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => linkMutation.mutate(term.id)}
                data-testid={`search-result-term-${term.id}`}
              >
                <span className="font-medium">{term.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">{term.category}</span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchQuery.length >= 2 && filteredResults.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
            No matching terms found
          </div>
        )}
      </div>

      {linkedTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linkedTerms.map(term => (
            <Badge
              key={term.id}
              variant="secondary"
              className="gap-1 pr-1 font-medium"
              data-testid={`chip-term-${term.id}`}
            >
              {term.name}
              <button
                type="button"
                onClick={() => unlinkMutation.mutate(term.id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                data-testid={`button-remove-term-${term.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-muted-foreground italic text-sm">Nothing to preview yet...</p>;
  }
  return (
    <div className="prose prose-sm max-w-none text-kat-charcoal leading-relaxed font-sans border rounded-md p-4 min-h-[200px] bg-muted/20">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => <h2 className="text-2xl font-header font-bold mt-8 mb-4">{children}</h2>,
          h2: ({ children }) => <h2 className="text-xl font-header font-bold mt-8 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-header font-bold mt-6 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-0">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
          pre: ({ children }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function ManagePrinciples() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [archiveTarget, setArchiveTarget] = useState<Principle | null>(null);

  const { data: principles = [], isLoading } = useQuery<PrincipleWithCount[]>({
    queryKey: ["/api/principles"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.principles.create(data as Partial<Principle>),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({ title: "Principle Created", description: `"${created.title}" has been created.` });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create principle.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Principle> }) => api.principles.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({ title: "Principle Updated", description: `"${updated.title}" has been saved.` });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update principle.", variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.principles.update(id, { status: "Archived" } as Partial<Principle>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({ title: "Principle Archived", description: "The principle has been archived." });
      setArchiveTarget(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to archive principle.", variant: "destructive" });
    },
  });

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingPrinciple(null);
  }, []);

  const handleOpenCreate = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((p: Principle) => {
    setEditingPrinciple(p);
    setForm({
      title: p.title,
      summary: p.summary,
      body: p.body,
      status: p.status === "Archived" ? "Draft" : p.status as "Draft" | "Published",
      visibility: p.visibility,
      tags: p.tags.join(", "),
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const tags = form.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPrinciple) {
      updateMutation.mutate({
        id: editingPrinciple.id,
        data: {
          title: form.title,
          summary: form.summary,
          body: form.body,
          status: form.status,
          visibility: form.visibility,
          tags,
        },
      });
    } else {
      const slug = slugify(form.title);
      createMutation.mutate({
        title: form.title,
        slug,
        summary: form.summary,
        body: form.body,
        status: form.status,
        visibility: form.visibility,
        tags,
      });
    }
  }, [form, editingPrinciple, createMutation, updateMutation]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const userRole = user?.role || null;
  const isAdmin = userRole ? canAdmin(userRole) : false;

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center" data-testid="permission-denied">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-header font-bold text-kat-black mb-2">Permission Denied</h1>
          <p className="text-muted-foreground">You need admin access to manage principles.</p>
        </div>
      </Layout>
    );
  }

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-header font-bold text-kat-black">Manage Principles</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and archive organizational principles. Link them to terms for context.
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
            onClick={handleOpenCreate}
            data-testid="button-create-principle"
          >
            <Plus className="h-4 w-4" />
            Create Principle
          </Button>
        </div>

        {principles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-header font-bold text-kat-black mb-2">No principles yet</h2>
            <p className="text-muted-foreground mb-4">Create your first organizational principle to get started.</p>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Principle
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden" data-testid="principles-list">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wide border-b">
              <span>Title</span>
              <span>Status</span>
              <span>Visibility</span>
              <span className="text-center">Terms</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-border">
              {principles.map(p => (
                <div
                  key={p.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors",
                    p.status === "Archived" && "opacity-60"
                  )}
                  data-testid={`row-principle-${p.id}`}
                >
                  <div className="min-w-0">
                    <h3 className={cn(
                      "font-header font-bold text-kat-black truncate",
                      p.status === "Archived" && "line-through"
                    )}>
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{relativeTime(p.updatedAt)}</span>
                    </div>
                  </div>

                  <PrincipleStatusBadge status={p.status} />

                  <Badge variant="outline" className="text-xs font-mono">
                    {p.visibility}
                  </Badge>

                  <Badge variant="secondary" className="text-xs font-mono justify-center min-w-[40px]">
                    {p.linkedTermCount ?? 0}
                  </Badge>

                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(p)}
                      data-testid={`button-edit-${p.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {p.status !== "Archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setArchiveTarget(p)}
                        data-testid={`button-archive-${p.id}`}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-header font-bold">
              {editingPrinciple ? "Edit Principle" : "Create Principle"}
            </DialogTitle>
            <DialogDescription>
              {editingPrinciple ? "Update the principle details below." : "Fill in the details for your new principle."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="principle-title">Title</Label>
              <Input
                id="principle-title"
                placeholder="e.g. Clarity over cleverness"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-principle-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principle-summary">Summary</Label>
              <Textarea
                id="principle-summary"
                placeholder="A brief summary of this principle..."
                value={form.summary}
                onChange={(e) => setForm(f => ({ ...f, summary: e.target.value }))}
                rows={2}
                data-testid="input-principle-summary"
              />
            </div>

            <div className="space-y-2">
              <Label>Body (Markdown)</Label>
              <Tabs defaultValue="edit">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview" data-testid="button-preview-toggle">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea
                    placeholder="Write markdown content here..."
                    value={form.body}
                    onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                    data-testid="input-principle-body"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <MarkdownPreview content={form.body} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm(f => ({ ...f, status: v as "Draft" | "Published" }))}
                >
                  <SelectTrigger data-testid="select-principle-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) => setForm(f => ({ ...f, visibility: v as "Internal" | "Client-Safe" | "Public" }))}
                >
                  <SelectTrigger data-testid="select-principle-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Client-Safe">Client-Safe</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="principle-tags">Tags (comma-separated)</Label>
              <Input
                id="principle-tags"
                placeholder="e.g. culture, engineering, design"
                value={form.tags}
                onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                data-testid="input-principle-tags"
              />
            </div>

            {editingPrinciple && (
              <TermLinker principleId={editingPrinciple.id} />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-white font-bold"
              onClick={handleSave}
              disabled={isSaving || !form.title.trim() || !form.summary.trim() || !form.body.trim()}
              data-testid="button-save-principle"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingPrinciple ? "Save Changes" : "Create Principle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Principle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark "{archiveTarget?.title}" as archived. It will remain viewable but will display an archived banner. You can restore it later by editing its status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
              disabled={archiveMutation.isPending}
              data-testid="button-confirm-archive"
            >
              {archiveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Archive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
