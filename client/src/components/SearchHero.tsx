import { useState, useRef, useEffect, useId, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TermCard } from "./TermCard";
import { useDebounce } from "@/hooks/useDebounce";
import { api, Term } from "@/lib/api";

export function SearchHero() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
  const showDropdown = isOpen && isSearchEnabled;

  useEffect(() => {
    if (isSearchEnabled) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isSearchEnabled]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
      const optionId = `search-option-${searchResults[highlightedIndex].id}`;
      const element = document.getElementById(optionId);
      if (element) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, searchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultSelect = useCallback((termId: string) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    navigate(`/term/${termId}`);
  }, [navigate]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && isSearchEnabled) {
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
      if (showDropdown && searchResults.length > 0) {
        setHighlightedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showDropdown && highlightedIndex > 0) {
        setHighlightedIndex(prev => prev - 1);
      } else if (showDropdown && highlightedIndex === 0) {
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
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }
  }

  const activeDescendant = highlightedIndex >= 0 && searchResults[highlightedIndex]
    ? `search-option-${searchResults[highlightedIndex].id}`
    : undefined;

  return (
    <div className="relative" data-testid="search-hero">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-header font-bold text-kat-black tracking-tight">
          The Canonical Source of Truth
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed font-sans max-w-xl mx-auto">
          Search the Lexicon to find organization-wide definitions, standards, and language.
          Reduce ambiguity and move faster.
        </p>

        <div className="relative max-w-xl mx-auto mt-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <Input
            ref={inputRef}
            data-testid="search-input"
            className="pl-11 h-14 text-lg bg-white shadow-sm border-border rounded-xl focus-visible:ring-primary focus-visible:border-primary font-sans"
            placeholder="Search terms, definitions, synonyms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (isSearchEnabled) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            autoComplete="off"
          />
          {showDropdown && !isSearching && (
            <div className="absolute right-3 top-3.5 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
              {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
            </div>
          )}
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="search-live-region"
        >
          {showDropdown && !isSearching && (
            `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} found for "${debouncedQuery}"`
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border border-border rounded-xl shadow-lg z-50 max-h-[60vh] overflow-y-auto"
          style={{ top: "calc(100% - 3.5rem)" }}
          data-testid="search-results"
        >
          {isSearching ? (
            <div className="p-4 space-y-3" data-testid="search-skeleton">
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
                  id={`search-option-${term.id}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`cursor-pointer p-3 rounded-lg transition-colors ${
                    index === highlightedIndex
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleResultSelect(term.id)}
                  data-testid={`search-result-${term.id}`}
                >
                  <TermCard term={term} highlightQuery={debouncedQuery} variant="inline" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center" data-testid="search-empty-state">
              <p className="text-muted-foreground mb-1">This term hasn't been added yet.</p>
              <p className="text-sm text-muted-foreground mb-4">
                No results for "<strong>{debouncedQuery}</strong>"
              </p>
              <a href={`/propose?name=${encodeURIComponent(debouncedQuery)}`}>
                <Button variant="default" size="sm" className="font-bold" data-testid="button-propose-from-search">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Propose this term
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
