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
  MoreVertical, Save, X, ChevronRight, Loader2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, Category, Term } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ManageCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "" });

  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: terms = [] } = useQuery<Term[]>({
    queryKey: ["/api/terms"],
  });

  const getTermCount = (catName: string) => terms.filter(t => t.category === catName).length;

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      api.categories.create({ name: data.name, description: data.description, color: "bg-primary", sortOrder: categories.length }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Created", description: "The new category has been added." });
      setNewCategoryOpen(false);
      setNewForm({ name: "", description: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description: string } }) => 
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
    setEditForm({ name: category.name, description: category.description });
    setEditingId(category.id);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-header font-bold text-kat-black">Manage Categories</h1>
            <p className="text-muted-foreground mt-2">
              Organize the Lexicon by adding, editing, or reordering domain categories.
            </p>
          </div>
          <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
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
              Categories appear in this order in navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {catsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group",
                      editingId === category.id && "bg-primary/5"
                    )}
                    data-testid={`category-row-${category.id}`}
                  >
                    
                    <div className={cn("h-3 w-3 rounded-full shrink-0", category.color)} />

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
                          <h3 className="font-header font-bold text-kat-black">{category.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                        </>
                      )}
                    </div>

                    <Badge variant="outline" className="shrink-0 text-xs font-bold">
                      {getTermCount(category.name)} terms
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-category-menu-${category.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(category)}>
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
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the "{category.name}" category. Terms in this category will become uncategorized.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(category.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            Tip: Deleting a category will not delete the terms within it. 
            Terms will become "Uncategorized" and can be reassigned.
          </p>
        </div>
      </div>
    </Layout>
  );
}
