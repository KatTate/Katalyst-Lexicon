import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}

export function highlightMatch(text: string, query: string): { before: string; match: string; after: string }[] {
  if (!query || query.length < 2) return [{ before: "", match: "", after: text }];

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const segments: { before: string; match: string; after: string }[] = [];

  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery);

  while (index !== -1) {
    const before = text.slice(lastIndex, index);
    const match = text.slice(index, index + query.length);
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);

    if (index === -1) {
      segments.push({ before, match, after: text.slice(lastIndex) });
    } else {
      segments.push({ before, match, after: "" });
    }
  }

  if (segments.length === 0) {
    return [{ before: "", match: "", after: text }];
  }

  return segments;
}
