import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, GripVertical, Edit2, Trash2, FolderOpen, 
  MoreVertical, Save, X, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES, MOCK_TERMS } from "@/lib/mockData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
  description: string;
  termCount: number;
  color: string;
}

const MOCK_CATEGORIES: Category[] = CATEGORIES.map((name, i) => ({
  id: `cat-${i}`,
  name,
  description: `Definitions and vocabulary related to ${name.toLowerCase()}.`,
  termCount: MOCK_TERMS.filter(t => t.category === name).length,
  color: ['bg-primary', 'bg-kat-basque', 'bg-kat-wheat', 'bg-kat-mystical', 'bg-kat-edamame', 'bg-kat-zeus', 'bg-kat-charcoal'][i] || 'bg-muted'
}));

export default function ManageCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

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
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2">
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
                  <Input id="name" placeholder="e.g. Quality Assurance" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe what terms belong in this category..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewCategoryOpen(false)}>Cancel</Button>
                <Button className="bg-primary text-white font-bold" onClick={() => setNewCategoryOpen(false)}>
                  <Save className="h-4 w-4 mr-2" />
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
              Drag to reorder. Categories appear in this order in navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {categories.map((category, index) => (
                <div 
                  key={category.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group",
                    editingId === category.id && "bg-primary/5"
                  )}
                >
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <div className={cn("h-3 w-3 rounded-full shrink-0", category.color)} />

                  <div className="flex-1 min-w-0">
                    {editingId === category.id ? (
                      <div className="space-y-2">
                        <Input defaultValue={category.name} className="font-bold" />
                        <Textarea defaultValue={category.description} className="text-sm" rows={2} />
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-primary text-white font-bold" onClick={() => setEditingId(null)}>
                            <Save className="h-3 w-3 mr-1" /> Save
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
                    {category.termCount} terms
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingId(category.id)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ChevronRight className="h-4 w-4 mr-2" />
                        View Terms
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
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
