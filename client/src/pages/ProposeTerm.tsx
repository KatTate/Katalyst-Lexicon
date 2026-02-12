import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Plus, X, Check, ChevronDown, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api, Category, Term } from "@/lib/api";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

type FormValues = z.infer<typeof formSchema>;

export default function ProposeTerm() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const editTermId = searchParams.get("editTermId");
  const prefillName = searchParams.get("name");
  const prefillCategory = searchParams.get("category");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [examplesGood, setExamplesGood] = useState<string[]>([]);
  const [examplesBad, setExamplesBad] = useState<string[]>([]);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [newGoodExample, setNewGoodExample] = useState("");
  const [newBadExample, setNewBadExample] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; id: string } | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [noChangesError, setNoChangesError] = useState(false);
  const [changeNoteError, setChangeNoteError] = useState(false);
  const formDirtyRef = useRef(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: editTerm } = useQuery<Term>({
    queryKey: ["/api/terms", editTermId],
    queryFn: () => api.terms.get(editTermId || ""),
    enabled: !!editTermId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prefillName || "",
      category: prefillCategory || "",
      definition: "",
      why_exists: "",
      used_when: "",
      not_used_when: "",
      change_note: "",
    },
    mode: "onBlur",
  });

  const watchedValues = form.watch();
  const isEditMode = !!editTermId;

  useEffect(() => {
    document.title = isEditMode
      ? `Suggest changes to: ${editTerm?.name || "..."} — Katalyst Lexicon`
      : "Propose a New Term — Katalyst Lexicon";
    return () => { document.title = "Katalyst Lexicon"; };
  }, [isEditMode, editTerm?.name]);

  const hasFormChanges = useMemo(() => {
    if (!isEditMode || !editTerm) return true;
    const formChanged = form.formState.isDirty;
    const arraysChanged =
      JSON.stringify(examplesGood) !== JSON.stringify(editTerm.examplesGood || []) ||
      JSON.stringify(examplesBad) !== JSON.stringify(editTerm.examplesBad || []) ||
      JSON.stringify(synonyms) !== JSON.stringify(editTerm.synonyms || []);
    return formChanged || arraysChanged;
  }, [isEditMode, editTerm, form.formState.isDirty, examplesGood, examplesBad, synonyms]);

  useEffect(() => {
    if (isEditMode && editTerm && prefilled) {
      const hasText = form.formState.isDirty || !!(watchedValues.change_note);
      const arraysChanged =
        JSON.stringify(examplesGood) !== JSON.stringify(editTerm.examplesGood || []) ||
        JSON.stringify(examplesBad) !== JSON.stringify(editTerm.examplesBad || []) ||
        JSON.stringify(synonyms) !== JSON.stringify(editTerm.synonyms || []);
      formDirtyRef.current = hasText || arraysChanged;
    } else {
      const hasText = !!(
        watchedValues.name ||
        watchedValues.category ||
        watchedValues.definition ||
        watchedValues.why_exists ||
        watchedValues.used_when ||
        watchedValues.not_used_when ||
        watchedValues.change_note
      );
      const hasArrays = examplesGood.length > 0 || examplesBad.length > 0 || synonyms.length > 0;
      formDirtyRef.current = hasText || hasArrays;
    }
  }, [watchedValues, examplesGood, examplesBad, synonyms, isEditMode, editTerm, prefilled, form.formState.isDirty]);

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

      const hasOptionalContent = !!(
        editTerm.usedWhen ||
        editTerm.notUsedWhen ||
        (editTerm.examplesGood && editTerm.examplesGood.length > 0) ||
        (editTerm.examplesBad && editTerm.examplesBad.length > 0) ||
        (editTerm.synonyms && editTerm.synonyms.length > 0)
      );
      if (hasOptionalContent) {
        setDetailOpen(true);
      }
    }
  }, [editTerm, prefilled, form]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (formDirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const navigateWithGuard = useCallback((path: string) => {
    if (formDirtyRef.current) {
      setPendingNavigation(path);
      setShowLeaveDialog(true);
    } else {
      setLocation(path);
    }
  }, [setLocation]);

  const confirmLeave = useCallback(() => {
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      formDirtyRef.current = false;
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, setLocation]);

  const cancelLeave = useCallback(() => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  }, []);

  const checkDuplicates = useCallback(async (name: string) => {
    if (name.length < 2) {
      setDuplicateWarning(null);
      return;
    }
    try {
      const results = await api.terms.search(name);
      const match = results.find(
        (t) => t.name.toLowerCase() === name.toLowerCase() || t.name.toLowerCase().startsWith(name.toLowerCase())
      );
      if (match) {
        setDuplicateWarning({ name: match.name, id: match.id });
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      setDuplicateWarning(null);
    }
  }, []);

  const shouldShowDuplicate = useMemo(() => {
    if (!duplicateWarning) return false;
    if (isEditMode && editTerm) {
      const currentName = form.getValues("name");
      if (currentName.toLowerCase() === editTerm.name.toLowerCase()) {
        return false;
      }
    }
    return true;
  }, [duplicateWarning, isEditMode, editTerm, watchedValues.name]);

  const markTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  }, []);

  const isFieldValid = (fieldName: keyof FormValues) => {
    const value = form.getValues(fieldName);
    const error = form.formState.errors[fieldName];
    return touchedFields.has(fieldName) && !error && value && String(value).length > 0;
  };

  const requiredFieldsFilled = !!(
    watchedValues.name && watchedValues.name.length >= 2 &&
    watchedValues.category &&
    watchedValues.definition && watchedValues.definition.length >= 10 &&
    watchedValues.why_exists && watchedValues.why_exists.length >= 5
  );

  const createProposal = useMutation({
    mutationFn: (values: FormValues) =>
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
      formDirtyRef.current = false;
      toast({
        title: isEditMode ? "Edit Submitted" : "Proposal Submitted",
        description: isEditMode
          ? "Your edit suggestion has been submitted for review."
          : "Your proposal has been submitted for review.",
        duration: 4000,
      });
      setTimeout(() => setLocation(isEditMode ? `/term/${editTermId}` : "/"), 1500);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 1000000,
      });
    },
  });

  function onSubmit(values: FormValues) {
    setNoChangesError(false);
    setChangeNoteError(false);

    if (isEditMode) {
      if (!hasFormChanges) {
        setNoChangesError(true);
        return;
      }
      if (!values.change_note || values.change_note.trim().length === 0) {
        setChangeNoteError(true);
        return;
      }
    }

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

  if (isEditMode && editTermId && !editTerm && !prefilled) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-12 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loading-edit-form" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div
            onClick={(e) => {
              e.preventDefault();
              navigateWithGuard(isEditMode ? `/term/${editTermId}` : "/");
            }}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-6"
            data-testid="link-back-home"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigateWithGuard(isEditMode ? `/term/${editTermId}` : "/");
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isEditMode ? "Back to term" : "Cancel and go back"}
          </div>
          <h1 className="text-3xl font-header text-primary" data-testid="text-propose-heading">
            {isEditMode ? `Suggest changes to: ${editTerm?.name || "..."}` : "Propose a New Term"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode
              ? "Propose changes to this term. Your edit will be reviewed before being applied."
              : "Help grow the lexicon by proposing a new term. All proposals are reviewed before being added."}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {noChangesError && (
                <Alert variant="destructive" data-testid="alert-no-changes">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No changes detected — please modify at least one field.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's the term?</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g. Phase Gate"
                            {...field}
                            className="pr-8"
                            data-testid="input-term-name"
                            aria-required="true"
                            onBlur={(e) => {
                              field.onBlur();
                              markTouched("name");
                              const nameValue = e.target.value;
                              if (isEditMode && editTerm && nameValue.toLowerCase() === editTerm.name.toLowerCase()) {
                                setDuplicateWarning(null);
                              } else {
                                checkDuplicates(nameValue);
                              }
                            }}
                          />
                          {isFieldValid("name") && (
                            <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" data-testid="icon-valid-name" />
                          )}
                        </div>
                      </FormControl>
                      {shouldShowDuplicate && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300" data-testid="warning-duplicate" role="alert">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            Heads up — a similar term already exists:{" "}
                            <Link href={`/term/${duplicateWarning!.id}`} className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
                              {duplicateWarning!.name}
                            </Link>
                          </span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which category does it belong to?</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          markTouched("category");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category" aria-required="true">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isFieldValid("category") && (
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                          <Check className="h-3 w-3" data-testid="icon-valid-category" />
                        </div>
                      )}
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
                    <FormLabel>What does this term mean?</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Write a clear, non-circular definition..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          data-testid="input-definition"
                          aria-required="true"
                          onBlur={() => {
                            field.onBlur();
                            markTouched("definition");
                          }}
                        />
                        {isFieldValid("definition") && (
                          <Check className="absolute right-2 top-3 h-4 w-4 text-green-600" data-testid="icon-valid-definition" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_exists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why does this term exist?</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="To prevent ambiguity about..."
                          {...field}
                          className="pr-8"
                          data-testid="input-why-exists"
                          aria-required="true"
                          onBlur={() => {
                            field.onBlur();
                            markTouched("why_exists");
                          }}
                        />
                        {isFieldValid("why_exists") && (
                          <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" data-testid="icon-valid-why-exists" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary w-full justify-start px-0"
                    data-testid="button-toggle-details"
                  >
                    {detailOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {detailOpen ? "Less detail" : "Add more detail"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 pt-4">
                  <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-dashed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="used_when"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>When should someone use this?</FormLabel>
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
                            <FormLabel>When should someone NOT use this?</FormLabel>
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
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Examples</h3>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-green-700 dark:text-green-400">Good Usage Examples</label>
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
                              <li key={i} className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2 dark:bg-green-950/30 dark:border-green-800">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
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
                        <label className="text-sm font-medium text-red-700 dark:text-red-400">Bad Usage Examples</label>
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
                              <li key={i} className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded px-3 py-2 dark:bg-red-950/30 dark:border-red-800">
                                <X className="h-4 w-4 text-red-600 flex-shrink-0" />
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

                  <div className="p-4 bg-muted/30 rounded-lg space-y-3 border border-dashed">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Synonyms</h3>
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
                </CollapsibleContent>
              </Collapsible>

              {isEditMode && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-700">
                  <FormField
                    control={form.control}
                    name="change_note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-amber-900 dark:text-amber-300">What did you change and why?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. Updated to reflect new company policy, Fixed typo in definition, Added missing usage context..."
                            rows={2}
                            {...field}
                            data-testid="input-change-note"
                            aria-required="true"
                            aria-describedby={changeNoteError ? "change-note-error" : undefined}
                            onChange={(e) => {
                              field.onChange(e);
                              if (changeNoteError && e.target.value.trim().length > 0) {
                                setChangeNoteError(false);
                              }
                            }}
                          />
                        </FormControl>
                        {changeNoteError && (
                          <p id="change-note-error" className="text-sm font-medium text-destructive" data-testid="error-change-note">
                            Please explain what you changed and why.
                          </p>
                        )}
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
                  disabled={createProposal.isPending || !requiredFieldsFilled}
                  aria-disabled={createProposal.isPending || !requiredFieldsFilled}
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

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent data-testid="dialog-unsaved-changes">
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leave anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave} data-testid="button-stay">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} data-testid="button-leave">Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div aria-live="polite" className="sr-only" data-testid="aria-live-region">
        {shouldShowDuplicate && duplicateWarning && `A similar term already exists: ${duplicateWarning.name}`}
        {noChangesError && "No changes detected — please modify at least one field."}
      </div>
    </Layout>
  );
}
