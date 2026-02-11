import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { TermCard } from "@/components/TermCard";
import { cn } from "@/lib/utils";
import { Link, useSearch, useLocation } from "wouter";
import { Loader2, Plus, X, ChevronDown, Filter } from "lucide-react";
import { Term, Category } from "@/lib/api";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const COLOR_MAP: Record<string, string> = {
  "bg-primary": "var(--color-primary)",
  "bg-kat-green": "var(--color-kat-green)",
  "bg-kat-charcoal": "var(--color-kat-charcoal)",
  "bg-kat-black": "var(--color-kat-black)",
  "bg-kat-gray": "var(--color-kat-gray)",
  "bg-kat-graylight": "var(--color-kat-graylight)",
  "bg-kat-warning": "var(--color-kat-warning)",
  "bg-kat-basque": "var(--color-kat-basque)",
  "bg-kat-edamame": "var(--color-kat-edamame)",
  "bg-kat-wheat": "var(--color-kat-wheat)",
  "bg-kat-zeus": "var(--color-kat-zeus)",
  "bg-kat-gauntlet": "var(--color-kat-gauntlet)",
  "bg-kat-mystical": "var(--color-kat-mystical)",
};

function getCategoryBorderColor(colorClass: string): string {
  return COLOR_MAP[colorClass] || "var(--color-primary)";
}

const STATUS_OPTIONS = ["Canonical", "Draft", "In Review", "Deprecated"] as const;
const VISIBILITY_OPTIONS = ["Internal", "Client-Safe", "Public"] as const;

type TermStatus = (typeof STATUS_OPTIONS)[number];
type TermVisibility = (typeof VISIBILITY_OPTIONS)[number];

const STATUS_URL_MAP: Record<string, TermStatus> = {
  canonical: "Canonical",
  draft: "Draft",
  "in-review": "In Review",
  deprecated: "Deprecated",
};

const STATUS_TO_URL: Record<string, string> = {
  Canonical: "canonical",
  Draft: "draft",
  "In Review": "in-review",
  Deprecated: "deprecated",
};

const VISIBILITY_URL_MAP: Record<string, TermVisibility> = {
  internal: "Internal",
  "client-safe": "Client-Safe",
  public: "Public",
};

const VISIBILITY_TO_URL: Record<string, string> = {
  Internal: "internal",
  "Client-Safe": "client-safe",
  Public: "public",
};

function parseFiltersFromURL(searchString: string) {
  const params = new URLSearchParams(searchString);
  const statusParam = params.get("status");
  const visibilityParam = params.get("visibility");

  const statusFilters: TermStatus[] = statusParam
    ? statusParam
        .split(",")
        .map((s) => STATUS_URL_MAP[s])
        .filter(Boolean)
    : [];

  const visibilityFilter: TermVisibility | null = visibilityParam
    ? VISIBILITY_URL_MAP[visibilityParam] || null
    : null;

  return { statusFilters, visibilityFilter };
}

function buildFilterURL(
  statusFilters: TermStatus[],
  visibilityFilter: TermVisibility | null
): string {
  const params = new URLSearchParams();
  if (statusFilters.length > 0) {
    params.set("status", statusFilters.map((s) => STATUS_TO_URL[s]).join(","));
  }
  if (visibilityFilter) {
    params.set("visibility", VISIBILITY_TO_URL[visibilityFilter]);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

interface CategoryGroup {
  category: Category;
  terms: Term[];
}

export default function Browse() {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const searchString = useSearch();
  const [, setLocation] = useLocation();

  const { statusFilters, visibilityFilter } = useMemo(
    () => parseFiltersFromURL(searchString),
    [searchString]
  );

  const filtersActive = statusFilters.length > 0 || visibilityFilter !== null;
  const activeFilterCount =
    statusFilters.length + (visibilityFilter ? 1 : 0);

  const updateFilters = useCallback(
    (newStatus: TermStatus[], newVisibility: TermVisibility | null) => {
      const url = "/browse" + buildFilterURL(newStatus, newVisibility);
      setLocation(url, { replace: true });
    },
    [setLocation]
  );

  const toggleStatus = useCallback(
    (status: TermStatus) => {
      const next = statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status];
      updateFilters(next, visibilityFilter);
    },
    [statusFilters, visibilityFilter, updateFilters]
  );

  const setVisibility = useCallback(
    (vis: string) => {
      const next = vis === "all" ? null : (VISIBILITY_URL_MAP[vis] || null);
      updateFilters(statusFilters, next);
    },
    [statusFilters, updateFilters]
  );

  const clearFilters = useCallback(() => {
    updateFilters([], null);
  }, [updateFilters]);

  const { data: terms = [], isLoading: termsLoading } = useQuery<Term[]>({
    queryKey: ["/api/terms"],
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  const isLoading = termsLoading || catsLoading;

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const filteredTerms = useMemo(() => {
    return terms.filter((t) => {
      if (statusFilters.length > 0 && !statusFilters.includes(t.status as TermStatus)) {
        return false;
      }
      if (visibilityFilter && t.visibility !== visibilityFilter) {
        return false;
      }
      return true;
    });
  }, [terms, statusFilters, visibilityFilter]);

  const categoryGroups: CategoryGroup[] = useMemo(() => {
    return sortedCategories.map((cat) => ({
      category: cat,
      terms: filteredTerms.filter((t) => t.category === cat.name),
    }));
  }, [sortedCategories, filteredTerms]);

  const visibleCategoryGroups = useMemo(() => {
    if (!filtersActive) return categoryGroups;
    return categoryGroups.filter((g) => g.terms.length > 0);
  }, [categoryGroups, filtersActive]);

  const totalFilteredTerms = filteredTerms.length;

  useEffect(() => {
    document.title = "Browse — Katalyst Lexicon";
    return () => {
      document.title = "Katalyst Lexicon";
    };
  }, []);

  const setSectionRef = useCallback(
    (categoryId: string, el: HTMLDivElement | null) => {
      if (el) {
        sectionRefs.current.set(categoryId, el);
      } else {
        sectionRefs.current.delete(categoryId);
      }
    },
    []
  );

  useEffect(() => {
    if (isMobile || sortedCategories.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setActiveCategory(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sectionRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isMobile, sortedCategories, visibleCategoryGroups]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const el = sectionRefs.current.get(categoryId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleJumpToCategory = useCallback(
    (categoryId: string) => {
      scrollToCategory(categoryId);
    },
    [scrollToCategory]
  );

  const filterBarContent = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        isMobile && "flex-col items-stretch"
      )}
      data-testid="filter-bar"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">
          Status
        </span>
        {STATUS_OPTIONS.map((status) => {
          const isSelected = statusFilters.includes(status);
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border min-h-[36px]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
              data-testid={`filter-status-${STATUS_TO_URL[status]}`}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">
          Visibility
        </span>
        <Select
          value={visibilityFilter ? VISIBILITY_TO_URL[visibilityFilter] : "all"}
          onValueChange={setVisibility}
        >
          <SelectTrigger
            className="w-[140px] h-9 text-xs"
            data-testid="filter-visibility"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="client-safe">Client-Safe</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtersActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
          data-testid="button-clear-filters"
        >
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <nav
          aria-label="Categories"
          className="hidden lg:block w-56 shrink-0 border-r bg-muted/10 p-4 sticky top-0 self-start h-screen overflow-y-auto"
          data-testid="browse-sidebar"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
            Categories
          </h2>
          <div className="space-y-1">
            {sortedCategories.map((cat) => {
              const count = filteredTerms.filter(
                (t) => t.category === cat.name
              ).length;
              const isActive = activeCategory === cat.id;
              if (filtersActive && count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center gap-2",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`sidebar-category-${cat.id}`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-foreground/10"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2 border-b pb-6">
              <h1
                className="text-3xl font-header text-primary"
                data-testid="heading-browse"
              >
                Browse Terms
              </h1>
              <p className="text-muted-foreground">
                Explore the complete organization vocabulary across all
                categories.
              </p>
            </div>

            {/* Filter Bar — Desktop */}
            {!isMobile && (
              <div className="py-2">{filterBarContent}</div>
            )}

            {/* Filter Bar — Mobile (Collapsible) */}
            {isMobile && (
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    data-testid="button-mobile-filters-toggle"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span
                          className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          data-testid="badge-active-filter-count"
                        >
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        filtersOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  {filterBarContent}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Mobile Jump to Category */}
            {isMobile && visibleCategoryGroups.length > 0 && (
              <div data-testid="jump-to-dropdown">
                <Select onValueChange={handleJumpToCategory}>
                  <SelectTrigger
                    className="w-full"
                    data-testid="jump-to-trigger"
                  >
                    <SelectValue placeholder="Jump to category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleCategoryGroups.map(({ category, terms: catTerms }) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({catTerms.length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : visibleCategoryGroups.length === 0 && filtersActive ? (
              <div
                className="py-20 text-center"
                data-testid="empty-state-no-filter-results"
              >
                <p className="text-muted-foreground mb-4">
                  No terms match these filters.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  data-testid="button-clear-filters-empty"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {visibleCategoryGroups.map(({ category, terms: catTerms }) => (
                  <section
                    key={category.id}
                    ref={(el) => setSectionRef(category.id, el)}
                    data-category-id={category.id}
                    className="scroll-mt-20"
                    data-testid={`category-section-${category.id}`}
                  >
                    <div
                      className="flex items-center gap-3 mb-6 border-l-4 pl-4 py-2"
                      style={{
                        borderLeftColor: getCategoryBorderColor(
                          category.color
                        ),
                      }}
                    >
                      <h2 className="text-xl font-header font-bold text-foreground">
                        {category.name}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {catTerms.length}{" "}
                        {catTerms.length === 1 ? "term" : "terms"}
                      </span>
                    </div>

                    {catTerms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catTerms.map((term) => (
                          <TermCard key={term.id} term={term} />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="py-12 text-center border border-dashed border-border rounded-lg"
                        data-testid={`empty-category-${category.id}`}
                      >
                        <p className="text-muted-foreground mb-4">
                          No terms in this category yet.
                        </p>
                        <Link
                          href={`/propose?category=${encodeURIComponent(category.name)}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`cta-propose-${category.id}`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Propose a term
                          </Button>
                        </Link>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {!isLoading && categoryGroups.length === 0 && !filtersActive && (
              <div className="py-20 text-center text-muted-foreground">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
