import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CATEGORIES } from "@/lib/mockData";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Term name must be at least 2 characters"),
  category: z.string({ required_error: "Please select a category" }),
  definition: z.string().min(10, "Definition should be comprehensive (at least 10 chars)"),
  why_exists: z.string().min(5, "Explain why this term is needed"),
  used_when: z.string().optional(),
  not_used_when: z.string().optional(),
});

export default function ProposeTerm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      definition: "",
      why_exists: "",
      used_when: "",
      not_used_when: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Proposal Submitted",
      description: "Your term has been submitted for review by the governance committee.",
    });
    setTimeout(() => setLocation("/"), 1500);
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <div className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel and go back
            </div>
          </Link>
          <h1 className="text-3xl font-serif text-primary">Propose a New Term</h1>
          <p className="text-muted-foreground mt-2">
            Submit a new term for the Katalyst Lexicon. All proposals are reviewed by domain stewards before being canonized.
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
                        <Input placeholder="e.g. Phase Gate" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use the most common name. Synonyms can be added later.
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                        <Input placeholder="To prevent ambiguity about..." {...field} />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Submit Proposal
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
