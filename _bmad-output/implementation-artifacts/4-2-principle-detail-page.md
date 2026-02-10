# Story 4.2: Principle Detail Page

Status: todo

## Story

As a user who selected a principle,
I want to read its full content rendered as formatted text and see which terms it connects to,
So that I understand the principle deeply and can explore related vocabulary.

## Acceptance Criteria

**Page Content:**

1. **Given** I navigate to a principle detail page, **When** the page loads, **Then** I see the principle title as the page heading (h1), the full summary text, the body content rendered as formatted markdown (headings, lists, bold, links), the status badge and visibility classification, and tags displayed as inline chips.

**Related Terms — Populated:**

2. **Given** the principle has linked terms, **When** I view the detail page, **Then** I see a "Related Terms" section listing the linked terms as TermCards. Clicking a linked term navigates me to that term's detail page (`/term/{id}`).

**Related Terms — Empty:**

3. **Given** the principle has no linked terms, **When** I view the detail page, **Then** the "Related Terms" section shows: "No terms linked to this principle yet".

**Archived Banner:**

4. **Given** the principle has status "Archived", **When** I view the detail page, **Then** I see a muted banner at the top: "This principle has been archived". The page content is still fully readable (not hidden or blocked). The banner uses gray/muted styling (not amber — it's informational, not a warning).

**Accessibility:**

5. **Given** I am using a screen reader, **When** I navigate the detail page, **Then** the page has a logical heading hierarchy (h1 for title, h2 for sections) and all interactive elements have accessible labels.

**Page Title:**

6. **Given** I navigate to a principle detail page, **When** the page loads, **Then** the browser tab title is "{Principle Title} — Katalyst Lexicon".

**Markdown Security:**

7. **Given** the principle body contains markdown content, **When** the body is rendered, **Then** HTML output is sanitized to prevent XSS from user-authored markdown. Script tags, event handlers, and dangerous HTML are stripped.

## Dev Notes

### Architecture Patterns to Follow

- **Brownfield context**: The principle detail page already exists at `client/src/pages/PrincipleDetail.tsx`. It renders: back link, status badge, visibility, title, archived banner, summary, body (markdown via custom `renderMarkdown()`), tags, related terms (as simple text links), and owner/updated metadata. This story enhances it with:
  1. **Proper markdown rendering**: Replace the custom `renderMarkdown()` function with `react-markdown` + `rehype-sanitize` for proper, secure markdown rendering with XSS protection.
  2. **Related Terms as TermCards**: Replace the current inline tag-style term links with proper TermCard components for richer display.
  3. **Empty state for Related Terms**: Add "No terms linked to this principle yet" when no terms are linked (currently the section just doesn't render).
  4. **Page title**: Add `document.title` update.
  5. **Heading hierarchy**: Ensure h2 sections for "Related Terms", "Tags", etc.
- **Markdown library choice**: Use `react-markdown` + `rehype-sanitize`. This combination provides:
  - Proper markdown parsing (headings, lists, bold, italic, links, code blocks)
  - Built-in XSS sanitization via `rehype-sanitize`
  - React component rendering (no `dangerouslySetInnerHTML`)
  - Custom component overrides for styling markdown elements to match the Katalyst design system
  - **Reuse note**: This library will also be needed in Epic 4 Story 4.2 (this story) and can be reused later for any markdown content.
- **TermCard reuse**: Use the existing `TermCard` component (variant="card") for related terms. This gives rich display with name, category, status badge, definition preview, and freshness signal — much better than the current simple tag links.
- **PrincipleStatusBadge**: Already inline in the file. Keep as-is unless extracting as part of Story 4.1.

### UI/UX Deliverables

**PrincipleDetail Page (`client/src/pages/PrincipleDetail.tsx`) — Enhancement:**
- Replace `renderMarkdown()` + `dangerouslySetInnerHTML` with `react-markdown` component
- Style markdown output using Tailwind prose classes + custom component overrides
- Replace related term tag links with TermCard grid
- Add "No terms linked to this principle yet" empty state
- Add page title: "{Principle Title} — Katalyst Lexicon"
- Ensure heading hierarchy: h1 for title, h2 for "Related Terms", "Tags" sections
- Archived banner already exists and uses correct muted styling — verify it matches AC

**Markdown Component Configuration:**
```
<ReactMarkdown
  rehypePlugins={[rehypeSanitize]}
  components={{
    h1: custom styling,
    h2: custom styling,
    h3: custom styling,
    p: custom styling,
    ul/ol/li: custom styling,
    a: custom styling + external link handling,
    strong/em: pass through,
    code/pre: custom styling
  }}
/>
```

### Anti-Patterns & Hard Constraints

- **DO NOT** keep the custom `renderMarkdown()` function. Replace it with `react-markdown` for proper parsing and security. The existing function uses `dangerouslySetInnerHTML` which is an XSS risk even with the basic `escapeHtml()` call (it doesn't handle all attack vectors).
- **DO NOT** use `marked` + `DOMPurify` — prefer `react-markdown` + `rehype-sanitize` because it renders React components directly (no `dangerouslySetInnerHTML`) and is the more idiomatic React approach.
- **DO NOT** render related terms as simple text links or tags. Use TermCard components for consistent, information-rich display.
- **DO NOT** hide or block page content when a principle is archived. The archived banner is informational only.

### Gotchas & Integration Warnings

- **New package required**: `react-markdown` and `rehype-sanitize` need to be installed. These are the only new packages for this story.
- **Custom `escapeHtml()` and `renderMarkdown()` functions**: These exist in `PrincipleDetail.tsx` (lines 26-50). They should be removed entirely after switching to `react-markdown`.
- **Related terms currently render only when terms exist**: The current code has `{relatedTerms.length > 0 && (...)}` which means no empty state is shown. Change to always render the section with either TermCards or the empty message.
- **TermCard in related terms context**: TermCards link to `/term/{id}`. Ensure they work correctly in this context — they should navigate to the term detail page when clicked.
- **Markdown body may be empty**: Handle gracefully. If `principle.body` is empty string, don't render the body section at all (or show a placeholder).
- **`rehype-sanitize` default schema**: The default sanitization schema is strict. If principle bodies need to include things like tables or specific HTML, you may need to extend the schema. Start with defaults and adjust if needed.
- **Prose styling**: Use `prose prose-lg` from Tailwind typography plugin if available, or use custom component overrides in `react-markdown`. The existing page uses `prose prose-lg max-w-none` which suggests Tailwind Typography is available.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/PrincipleDetail.tsx` | MODIFY | Replace markdown rendering, add TermCards for related terms, add empty state, add page title, remove custom renderMarkdown |

### Dependencies & Environment Variables

**Packages to install:**
- `react-markdown` — React component for rendering markdown
- `rehype-sanitize` — Sanitization plugin for rehype (XSS protection)

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query` — server state management
- `wouter` — routing
- `lucide-react` — icons
- All shadcn/ui components

**No environment variables needed.**

### References

- Epic 4 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 4, Story 4.2
- Existing principle detail page: `client/src/pages/PrincipleDetail.tsx`
- Existing TermCard component: `client/src/components/TermCard.tsx`
- Existing principle API: `server/routes.ts` → `GET /api/principles/:id`, `GET /api/principles/:id/terms`
- Schema: `shared/schema.ts` → `principles`, `principleTermLinks`
- Scratchpad note: "Choose react-markdown + rehype-sanitize during Story 4.2, reuse in Epic 4 Story 4.2"
