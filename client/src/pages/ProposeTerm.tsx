import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api, Category, Term } from "@/lib/api";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "Term name must be at least 2 characters"),
  category: z.string({ required_error: "Please select a category" }),
  definition: z.string().min(10, "Definition should be comprehensive (at least 10 chars)"),
  why_exists: z.string().min(5, "Explain why this term is needed"),
  used_when: z.string().optional(),
  not_used_when: z.string().optional(),
  change_note: z.string().optional(),
});

export default function ProposeTerm() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const editTermId = searchParams.get("editTermId");
  const prefillName = searchParams.get("name");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [examplesGood, setExamplesGood] = useState<string[]>([]);
  const [examplesBad, setExamplesBad] = useState<string[]>([]);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [newGoodExample, setNewGoodExample] = useState("");
  const [newBadExample, setNewBadExample] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: editTerm } = useQuery<Term>({
    queryKey: ["/api/terms", editTermId],
    queryFn: () => api.terms.get(editTermId || ""),
    enabled: !!editTermId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prefillName || "",
      definition: "",
      why_exists: "",
      used_when: "",
      not_used_when: "",
      change_note: "",
    },
  });

  useEffect(() => {
    if (editTerm && !prefilled) {
      form.reset({
        name: editTerm.name,
        category: editTerm.category,
        definition: editTerm.definition,
        why_exists: editTerm.whyExists,
        used_when: editTerm.usedWhen,
        not_used_when: editTerm.notUsedWhen,
        change_note: "",
      });
      setExamplesGood(editTerm.examplesGood || []);
      setExamplesBad(editTerm.examplesBad || []);
      setSynonyms(editTerm.synonyms || []);
      setPrefilled(true);
    }
  }, [editTerm, prefilled, form]);

  const isEditMode = !!editTermId;

  const createProposal = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => 
      api.proposals.create({
        termId: isEditMode ? editTermId : undefined,
        termName: values.name,
        category: values.category,
        type: isEditMode ? "edit" : "new",
        status: "pending",
        submittedBy: "Current User",
        changesSummary: isEditMode ? (values.change_note || `Edit proposal for: ${values.name}`) : `New term proposal: ${values.name}`,
        definition: values.definition,
        whyExists: values.why_exists,
        usedWhen: values.used_when || "",
        notUsedWhen: values.not_used_when || "",
        examplesGood,
        examplesBad,
        synonyms,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: isEditMode ? "Edit Submitted" : "Proposal Submitted",
        description: isEditMode
          ? "Your suggested edit has been submitted for review."
          : "Your term has been submitted for review by the governance committee.",
      });
      setTimeout(() => setLocation(isEditMode ? `/term/${editTermId}` : "/"), 1500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createProposal.mutate(values);
  }

  const addGoodExample = () => {
    if (newGoodExample.trim()) {
      setExamplesGood([...examplesGood, newGoodExample.trim()]);
      setNewGoodExample("");
    }
  };

  const addBadExample = () => {
    if (newBadExample.trim()) {
      setExamplesBad([...examplesBad, newBadExample.trim()]);
      setNewBadExample("");
    }
  };

  const addSynonym = () => {
    if (newSynonym.trim()) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym("");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href={isEditMode ? `/term/${editTermId}` : "/"}>
            <div className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-6" data-testid="link-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isEditMode ? "Back to term" : "Cancel and go back"}
            </div>
          </Link>
          <h1 className="text-3xl font-header text-primary" data-testid="text-propose-heading">
            {isEditMode ? `Suggest an Edit to "${editTerm?.name || "..."}"` : "Propose a New Term"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode
              ? "Propose changes to this term. Your edit will be reviewed before being applied."
              : "Submit a new term for the Katalyst Lexicon. All proposals are reviewed by domain stewards before being canonized."}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Phase Gate" {...field} readOnly={isEditMode} className={isEditMode ? "bg-muted" : ""} data-testid="input-term-name" />
                      </FormControl>
                      <FormDescription>
                        {isEditMode ? "Term name cannot be changed in edit proposals." : "Use the most common name. Add synonyms below."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain / Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a clear, non-circular definition..." 
                        className="min-h-[120px] resize-none"
                        {...field}
                        data-testid="input-definition"
                      />
                    </FormControl>
                    <FormDescription>
                      Avoid using the term itself in the definition. Focus on clarity and precision.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-dashed">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Context & Usage</h3>
                
                <FormField
                  control={form.control}
                  name="why_exists"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why does this exist?</FormLabel>
                      <FormControl>
                        <Input placeholder="To prevent ambiguity about..." {...field} data-testid="input-why-exists" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="used_when"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Used When (Inclusion)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Discussing project milestones..." 
                            className="h-20 resize-none"
                            {...field}
                            data-testid="input-used-when"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="not_used_when"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Not Used When (Exclusion)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Referring to general goals..." 
                            className="h-20 resize-none"
                            {...field}
                            data-testid="input-not-used-when"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-6 border border-dashed">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Synonyms</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an alternate name or abbreviation..."
                      value={newSynonym}
                      onChange={(e) => setNewSynonym(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSynonym())}
                      data-testid="input-synonym"
                    />
                    <Button type="button" variant="outline" onClick={addSynonym} data-testid="button-add-synonym">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {synonyms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {synonyms.map((syn, i) => (
                        <Badge key={i} variant="secondary" className="gap-1 pr-1">
                          {syn}
                          <button
                            type="button"
                            onClick={() => setSynonyms(synonyms.filter((_, idx) => idx !== i))}
                            className="ml-1 hover:bg-muted rounded"
                            data-testid={`button-remove-synonym-${i}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Include abbreviations, acronyms, or alternate names that should resolve to this term.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-6 border border-dashed">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Examples</h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-green-700">Good Usage Examples</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an example of correct usage..."
                        value={newGoodExample}
                        onChange={(e) => setNewGoodExample(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoodExample())}
                        data-testid="input-good-example"
                      />
                      <Button type="button" variant="outline" onClick={addGoodExample} data-testid="button-add-good-example">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {examplesGood.length > 0 && (
                      <ul className="space-y-1">
                        {examplesGood.map((ex, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                            <span className="text-green-600">✓</span>
                            <span className="flex-1">{ex}</span>
                            <button
                              type="button"
                              onClick={() => setExamplesGood(examplesGood.filter((_, idx) => idx !== i))}
                              className="text-muted-foreground hover:text-destructive"
                              data-testid={`button-remove-good-example-${i}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-red-700">Bad Usage Examples</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an example of incorrect usage..."
                        value={newBadExample}
                        onChange={(e) => setNewBadExample(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadExample())}
                        data-testid="input-bad-example"
                      />
                      <Button type="button" variant="outline" onClick={addBadExample} data-testid="button-add-bad-example">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {examplesBad.length > 0 && (
                      <ul className="space-y-1">
                        {examplesBad.map((ex, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                            <span className="text-red-600">✗</span>
                            <span className="flex-1">{ex}</span>
                            <button
                              type="button"
                              onClick={() => setExamplesBad(examplesBad.filter((_, idx) => idx !== i))}
                              className="text-muted-foreground hover:text-destructive"
                              data-testid={`button-remove-bad-example-${i}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-700">
                  <FormField
                    control={form.control}
                    name="change_note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-amber-900 dark:text-amber-300">Why are you making this change?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. Updated to reflect new company policy, Fixed typo in definition, Added missing usage context..."
                            rows={2}
                            {...field}
                            data-testid="input-change-note"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto"
                  disabled={createProposal.isPending}
                  data-testid="button-submit-proposal"
                >
                  {createProposal.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? "Submit Edit for Review" : "Submit Proposal"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
