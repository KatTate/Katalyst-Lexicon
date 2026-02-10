import { useState, useRef, useEffect, useId, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TermCard } from "./TermCard";
import { useDebounce } from "@/hooks/useDebounce";
import { api, Term } from "@/lib/api";

interface SpotlightSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpotlightSearch({ open, onOpenChange }: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [, navigate] = useLocation();

  const isSearchEnabled = debouncedQuery.length >= 2;

  const { data: searchResults = [], isLoading, isFetching } = useQuery<Term[]>({
    queryKey: ["/api/terms/search", debouncedQuery],
    queryFn: () => api.terms.search(debouncedQuery),
    enabled: isSearchEnabled,
    staleTime: 30_000,
  });

  const isSearching = isLoading || isFetching;
  const showResults = isSearchEnabled;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlightedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
      const optionId = `spotlight-option-${searchResults[highlightedIndex].id}`;
      const element = document.getElementById(optionId);
      if (element) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, searchResults]);

  const handleResultSelect = useCallback((termId: string) => {
    onOpenChange(false);
    setQuery("");
    setHighlightedIndex(-1);
    navigate(`/term/${termId}`);
  }, [navigate, onOpenChange]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onOpenChange(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showResults && searchResults.length > 0) {
        setHighlightedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showResults && highlightedIndex > 0) {
        setHighlightedIndex(prev => prev - 1);
      } else if (showResults && highlightedIndex === 0) {
        setHighlightedIndex(-1);
      }
      return;
    }

    if (e.key === "Enter") {
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        e.preventDefault();
        handleResultSelect(searchResults[highlightedIndex].id);
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      onOpenChange(false);
      return;
    }
  }

  const activeDescendant = highlightedIndex >= 0 && searchResults[highlightedIndex]
    ? `spotlight-option-${searchResults[highlightedIndex].id}`
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-full max-h-full w-full max-w-full rounded-none p-0 flex flex-col [&>button]:min-h-[44px] [&>button]:min-w-[44px]"
        data-testid="spotlight-overlay"
      >
        <SheetTitle className="sr-only">Search the Lexicon</SheetTitle>
        <SheetDescription className="sr-only">Type to search terms, definitions, and synonyms</SheetDescription>
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="flex-shrink-0">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <Input
            ref={inputRef}
            data-testid="spotlight-search-input"
            className="flex-1 h-12 text-lg border-0 shadow-none focus-visible:ring-0 font-sans"
            placeholder="Search terms, definitions, synonyms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showResults}
            aria-controls={showResults ? listboxId : undefined}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            autoComplete="off"
          />
          {showResults && !isSearching && (
            <div className="flex-shrink-0 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
              {searchResults.length}
            </div>
          )}
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="spotlight-live-region"
        >
          {showResults && !isSearching && (
            `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} found for "${debouncedQuery}"`
          )}
        </div>

        {showResults && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="flex-1 overflow-y-auto"
            data-testid="spotlight-results"
          >
            {isSearching ? (
              <div className="p-4 space-y-3" data-testid="spotlight-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((term, index) => (
                  <div
                    key={term.id}
                    id={`spotlight-option-${term.id}`}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={`cursor-pointer p-3 min-h-[44px] rounded-lg transition-colors ${
                      index === highlightedIndex
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-muted/50 active:bg-muted"
                    }`}
                    onClick={() => handleResultSelect(term.id)}
                    data-testid={`spotlight-result-${term.id}`}
                  >
                    <TermCard term={term} highlightQuery={debouncedQuery} variant="inline" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center" data-testid="spotlight-empty-state">
                <p className="text-muted-foreground mb-1">This term hasn't been added yet.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  No results for "<strong>{debouncedQuery}</strong>"
                </p>
                <a href={`/propose?name=${encodeURIComponent(debouncedQuery)}`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="font-bold min-h-[44px] min-w-[44px]"
                    data-testid="spotlight-propose-button"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Propose this term
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}

        {!showResults && (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Start typing to search terms, definitions, and synonyms
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
