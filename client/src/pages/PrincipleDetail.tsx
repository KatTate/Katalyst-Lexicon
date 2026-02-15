import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useRoute } from "wouter";
import { ArrowLeft, Loader2, User, Calendar, Eye, Tag } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";
import { api, Principle, Term } from "@/lib/api";
import { PrincipleStatusBadge } from "@/components/PrincipleStatusBadge";
import { TermCard } from "@/components/TermCard";
import { EmptyState } from "@/components/EmptyState";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

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

  useEffect(() => {
    if (principle) {
      document.title = `${principle.title} — Katalyst Lexicon`;
    }
    return () => { document.title = "Katalyst Lexicon"; };
  }, [principle]);

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
                <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 border rounded" data-testid="text-principle-visibility">
                  {principle.visibility}
                </span>
              </div>
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-header font-bold text-foreground tracking-tight",
                  isArchived && "line-through decoration-muted-foreground/30 text-muted-foreground"
                )}
                data-testid="text-principle-title"
              >
                {principle.title}
              </h1>
            </div>
          </div>

          {isArchived && (
            <div className="bg-muted border border-border p-4 rounded-lg flex items-start gap-3" data-testid="banner-archived">
              <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">This principle has been archived</p>
            </div>
          )}

          <p className="text-lg text-foreground/80" data-testid="text-principle-summary">
            {principle.summary}
          </p>
        </div>

        {principle.body && (
          <div className="py-8 border-b border-border">
            <div
              className="prose prose-lg max-w-none text-foreground/80 leading-relaxed font-sans"
              data-testid="text-principle-body"
            >
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
                {principle.body}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {principle.tags.length > 0 && (
          <div className="py-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide" data-testid="heading-tags">Tags</h2>
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

        <div className="py-6 border-b border-border">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3" data-testid="heading-related-terms">Related Terms</h2>
          {relatedTerms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="related-terms-grid">
              {relatedTerms.map(term => (
                <TermCard key={term.id} term={term} variant="card" />
              ))}
            </div>
          ) : (
            <EmptyState message="No terms linked to this principle yet" data-testid="empty-related-terms" />
          )}
        </div>

        <div className="py-8 flex items-center justify-between text-sm text-muted-foreground bg-muted/20 px-6 rounded-lg mt-8 border border-border" data-testid="section-metadata">
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
