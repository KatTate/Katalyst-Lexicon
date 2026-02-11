import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useRoute } from "wouter";
import { ArrowLeft, Loader2, User, Calendar, Eye, Tag } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";
import { api, Principle, Term } from "@/lib/api";
import { PrincipleStatusBadge } from "@/components/PrincipleStatusBadge";

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

function renderMarkdown(text: string): string {
  const escapedText = escapeHtml(text);
  let html = escapedText
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-header font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-header font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-header font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>');
  
  return `<p class="mb-4">${html}</p>`;
}

export default function PrincipleDetail() {
  const [match, params] = useRoute("/principle/:slug");

  const { data: principle, isLoading, error } = useQuery<Principle>({
    queryKey: ["/api/principles", params?.slug],
    queryFn: () => api.principles.get(params?.slug || ""),
    enabled: !!params?.slug,
  });

  const { data: relatedTerms = [] } = useQuery<Term[]>({
    queryKey: ["/api/principles", principle?.id, "terms"],
    queryFn: () => api.principles.getTerms(principle?.id || ""),
    enabled: !!principle?.id,
  });

  if (!match) return <NotFound />;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]" data-testid="loading-principle">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !principle) return <NotFound />;

  const isArchived = principle.status === "Archived";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <Link href="/principles">
            <div className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-back-principles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Principles
            </div>
          </Link>
        </div>

        <div className="space-y-6 border-b border-border pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PrincipleStatusBadge status={principle.status} />
                <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 border rounded">
                  {principle.visibility}
                </span>
              </div>
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-header font-bold text-kat-black tracking-tight",
                  isArchived && "line-through decoration-muted-foreground/30 text-muted-foreground"
                )}
                data-testid="text-principle-title"
              >
                {principle.title}
              </h1>
            </div>
          </div>

          {isArchived && (
            <div className="bg-muted border border-border p-4 rounded-lg flex items-start gap-3">
              <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-muted-foreground">This principle is Archived</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  It is kept for historical reference but is no longer active guidance.
                </p>
              </div>
            </div>
          )}

          <p className="text-lg text-kat-charcoal" data-testid="text-principle-summary">
            {principle.summary}
          </p>
        </div>

        <div className="py-8 border-b border-border">
          <div
            className="prose prose-lg max-w-none text-kat-charcoal leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(principle.body) }}
            data-testid="text-principle-body"
          />
        </div>

        {principle.tags.length > 0 && (
          <div className="py-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {principle.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-muted text-foreground px-3 py-1 rounded-md text-sm font-medium border border-border"
                  data-testid={`tag-${tag}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {relatedTerms.length > 0 && (
          <div className="py-6 border-b border-border">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">Related Terms</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map(term => (
                <Link key={term.id} href={`/term/${term.id}`}>
                  <span
                    className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium border border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                    data-testid={`link-term-${term.id}`}
                  >
                    {term.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="py-8 flex items-center justify-between text-sm text-muted-foreground bg-muted/20 px-6 rounded-lg mt-8 border border-border">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-bold text-foreground">Owner:</span> {principle.owner}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-bold text-foreground">Updated:</span> {new Date(principle.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
