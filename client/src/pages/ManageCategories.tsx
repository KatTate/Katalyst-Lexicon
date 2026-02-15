import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Edit2, Trash2, FolderOpen, 
  MoreVertical, Save, X, ChevronRight, Loader2,
  ArrowUp, ArrowDown, ShieldAlert
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, Category, Term } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { canAdmin, type UserRole } from "@shared/permissions";

const COLOR_PRESETS = [
  { hex: "#78c026", label: "Green" },
  { hex: "#656d12", label: "Basque" },
  { hex: "#d9cbaf", label: "Wheat" },
  { hex: "#a6a2a9", label: "Mystical" },
  { hex: "#97a687", label: "Edamame" },
  { hex: "#a5a092", label: "Zeus" },
  { hex: "#4f524c", label: "Charcoal" },
  { hex: "#8b898b", label: "Gauntlet" },
];

function ColorPicker({ value, onChange, testIdPrefix }: { value: string; onChange: (hex: string) => void; testIdPrefix: string }) {
  return (
    <div className="space-y-2" data-testid={`${testIdPrefix}-color-picker`}>
      <Label>Color</Label>
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all",
                value === preset.hex ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground/50"
              )}
              style={{ backgroundColor: preset.hex }}
              onClick={() => onChange(preset.hex)}
              title={preset.label}
              data-testid={`${testIdPrefix}-color-preset-${preset.label.toLowerCase()}`}
            />
          ))}
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="w-24 text-xs font-mono"
          data-testid={`input-category-color`}
        />
        <div
          className="h-7 w-7 rounded-full border shrink-0 dark:ring-1 dark:ring-foreground/20"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

export default function ManageCategories() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", color: "", sortOrder: 0 });
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "", color: "#78c026", sortOrder: 0 });

  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: terms = [] } = useQuery<Term[]>({
    queryKey: ["/api/terms"],
  });

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const getTermCount = (catName: string) => terms.filter(t => t.category === catName).length;

  useEffect(() => {
    document.title = "Manage Categories — Katalyst Lexicon";
    return () => { document.title = "Katalyst Lexicon"; };
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string; color: string; sortOrder: number }) => 
      api.categories.create({ name: data.name, description: data.description, color: data.color, sortOrder: data.sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Created", description: "The new category has been added." });
      setNewCategoryOpen(false);
      setNewForm({ name: "", description: "", color: "#78c026", sortOrder: categories.length });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => 
      api.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Updated", description: "Your changes have been saved." });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Deleted", description: "The category has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    },
  });

  const handleStartEdit = (category: Category) => {
    setEditForm({ name: category.name, description: category.description, color: category.color, sortOrder: category.sortOrder });
    setEditingId(category.id);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm });
    }
  };

  const handleReorder = (categoryId: string, direction: "up" | "down") => {
    const idx = sortedCategories.findIndex(c => c.id === categoryId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedCategories.length) return;

    const current = sortedCategories[idx];
    const neighbor = sortedCategories[swapIdx];

    updateMutation.mutate(
      { id: current.id, data: { sortOrder: neighbor.sortOrder } },
      {
        onSuccess: () => {
          updateMutation.mutate({ id: neighbor.id, data: { sortOrder: current.sortOrder } });
        },
      }
    );
  };

  if (authLoading || catsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !canAdmin(user.role as UserRole)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center" data-testid="permission-denied">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-header font-bold text-foreground mb-2">Permission Denied</h1>
          <p className="text-muted-foreground">You need admin access to manage categories.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-header font-bold text-foreground">Manage Categories</h1>
            <p className="text-muted-foreground mt-2">
              Organize the Lexicon by adding, editing, or reordering domain categories.
            </p>
          </div>
          <Dialog open={newCategoryOpen} onOpenChange={(open) => {
            setNewCategoryOpen(open);
            if (open) setNewForm(f => ({ ...f, sortOrder: categories.length }));
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2" data-testid="button-add-category">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-header font-bold">Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new domain category to organize terms.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Quality Assurance" 
                    value={newForm.name}
                    onChange={(e) => setNewForm(f => ({ ...f, name: e.target.value }))}
                    data-testid="input-new-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what terms belong in this category..."
                    value={newForm.description}
                    onChange={(e) => setNewForm(f => ({ ...f, description: e.target.value }))}
                    data-testid="input-new-category-description"
                  />
                </div>
                <ColorPicker
                  value={newForm.color}
                  onChange={(hex) => setNewForm(f => ({ ...f, color: hex }))}
                  testIdPrefix="new"
                />
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Position</Label>
                  <Input 
                    id="sortOrder" 
                    type="number"
                    min={0}
                    value={newForm.sortOrder}
                    onChange={(e) => setNewForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    data-testid="input-new-category-sort"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewCategoryOpen(false)}>Cancel</Button>
                <Button 
                  className="bg-primary text-white font-bold" 
                  onClick={() => createMutation.mutate(newForm)}
                  disabled={createMutation.isPending || !newForm.name.trim()}
                  data-testid="button-create-category"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-header flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Active Categories
            </CardTitle>
            <CardDescription>
              Categories appear in this order in navigation. Use the arrows to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0" data-testid="category-list">
            {sortedCategories.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No categories yet. Click "Add Category" to create one.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedCategories.map((category, idx) => {
                  const termCount = getTermCount(category.name);
                  return (
                    <div 
                      key={category.id}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group",
                        editingId === category.id && "bg-primary/5"
                      )}
                      data-testid={`category-row-${category.id}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={idx === 0 || updateMutation.isPending}
                          onClick={() => handleReorder(category.id, "up")}
                          data-testid={`button-reorder-up-${category.id}`}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={idx === sortedCategories.length - 1 || updateMutation.isPending}
                          onClick={() => handleReorder(category.id, "down")}
                          data-testid={`button-reorder-down-${category.id}`}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div
                        className="h-3 w-3 rounded-full shrink-0 dark:ring-1 dark:ring-foreground/20"
                        style={{ backgroundColor: category.color }}
                      />

                      <div className="flex-1 min-w-0">
                        {editingId === category.id ? (
                          <div className="space-y-2">
                            <Input 
                              value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="font-bold"
                              data-testid="input-edit-category-name"
                            />
                            <Textarea 
                              value={editForm.description}
                              onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                              className="text-sm" 
                              rows={2}
                              data-testid="input-edit-category-description"
                            />
                            <ColorPicker
                              value={editForm.color}
                              onChange={(hex) => setEditForm(f => ({ ...f, color: hex }))}
                              testIdPrefix="edit"
                            />
                            <div className="space-y-2">
                              <Label>Sort Position</Label>
                              <Input 
                                type="number"
                                min={0}
                                value={editForm.sortOrder}
                                onChange={(e) => setEditForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                                className="w-24"
                                data-testid="input-edit-category-sort"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-primary text-white font-bold" 
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
                                data-testid="button-save-category"
                              >
                                {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-header font-bold text-foreground">{category.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                          </>
                        )}
                      </div>

                      <Badge variant="secondary" className="shrink-0 text-xs font-mono" data-testid={`sort-position-${category.id}`}>
                        #{category.sortOrder}
                      </Badge>

                      <Badge variant="outline" className="shrink-0 text-xs font-bold">
                        {termCount} terms
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-category-menu-${category.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEdit(category)} data-testid={`button-edit-${category.id}`}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <Link href={`/browse?category=${encodeURIComponent(category.name)}`}>
                            <DropdownMenuItem>
                              <ChevronRight className="h-4 w-4 mr-2" />
                              View Terms
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                                data-testid={`button-delete-${category.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {termCount > 0
                                    ? `This category has ${termCount} terms. Reassign them before deleting.`
                                    : `This will permanently remove the "${category.name}" category.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                                {termCount === 0 && (
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteMutation.mutate(category.id)}
                                    data-testid={`button-confirm-delete-${category.id}`}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                )}
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            Tip: Categories with assigned terms cannot be deleted. 
            Reassign terms to another category first.
          </p>
        </div>
      </div>
    </Layout>
  );
}
