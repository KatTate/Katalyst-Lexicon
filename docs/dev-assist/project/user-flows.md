# User Flows

*Source: Original design document + current implementation + validation 2026-01-10*

## Roles (Confirmed)

### Role: Member
**Primary Goal:** Find and use correct terminology, propose new terms
**Permission Level:** Browse, search, propose new terms/edits
**Frequency:** Daily (during meetings, content creation)

**Key Actions:**
1. Search for terms - High
2. Browse by category - Medium
3. Read principles - Medium
4. Propose new term - Low
5. Propose edit to existing term - Low

---

### Role: Approver
**Primary Goal:** Ensure vocabulary quality and governance
**Permission Level:** All Member permissions + review and publish
**Frequency:** Weekly (batch review of proposals)

**Key Actions:**
1. Review pending proposals - High
2. Approve/reject proposals - High
3. Request changes - Medium
4. Search and browse - Medium

---

### Role: Admin
**Primary Goal:** Manage system and users
**Permission Level:** Full access including settings and user management
**Frequency:** Occasionally (setup, user management)

**Key Actions:**
1. Manage users and roles - Low
2. Configure settings - Low
3. Manage categories - Low
4. All Approver actions - Medium

---

## Authentication Model (Confirmed)

| Action | Auth Required |
|--------|---------------|
| Browse terms | No |
| Search terms | No |
| View term detail | No |
| Browse principles | No |
| View principle detail | No |
| Propose new term | Yes (Google SSO) |
| Propose edit | Yes (Google SSO) |
| Review proposals | Yes (Google SSO) |
| Approve/reject | Yes (Google SSO) |
| Admin settings | Yes (Google SSO) |

*Note: Auth not yet implemented. To be added at publish time.*

---

## Flow Narratives

### Flow: Quick Term Lookup (Most Common)

**Role:** Any user (no auth required)
**Trigger:** User is in a meeting or creating content and needs to confirm terminology
**Starting Point:** Any page (via global search) or Home page

**Steps:**
1. User types in search bar → Search results appear
2. User scans results → Sees matching terms with status badges
3. User clicks on term → Term detail page opens
4. User reads definition and usage rules → Confirms understanding
5. User returns to their work → Uses term correctly

**Success State:** User found the term quickly and has confidence in correct usage

**Navigation Touchpoints:**
- Global search bar (always visible in header)
- Search results list
- Term detail page
- Back to search/browse

---

### Flow: Browse by Category

**Role:** Any user (no auth required)
**Trigger:** User wants to explore terminology in a specific domain
**Starting Point:** Home page or Navigation menu

**Steps:**
1. User clicks category in sidebar → Category page loads
2. User scans term list → Sees all terms in that category
3. User optionally filters by status → List updates
4. User clicks on term → Term detail opens
5. User navigates to related terms or back to list

**Success State:** User understands the vocabulary landscape for a domain

**Navigation Touchpoints:**
- Category sidebar/menu
- Category landing page
- Filter controls
- Term detail page

---

### Flow: Read Principles

**Role:** Any user (no auth required)
**Trigger:** User wants to understand organizational philosophy
**Starting Point:** Navigation menu → Principles

**Steps:**
1. User clicks Principles in nav → Principles list loads
2. User scans principle cards → Sees titles, summaries, status badges
3. User clicks on principle → Full principle detail with markdown content
4. User sees related terms → Can navigate to linked terms
5. User returns to list or navigates to a term

**Success State:** User understands the principle and its related vocabulary

**Navigation Touchpoints:**
- Principles nav link
- Principles list page
- Principle detail page
- Related terms links

---

### Flow: Propose New Term

**Role:** Member (auth required)
**Trigger:** User encounters a term that should be in the lexicon but isn't
**Starting Point:** Search results (no results) or Propose button

**Steps:**
1. User clicks "Propose New Term" → Proposal form opens
2. User fills required fields (name, category, definition, why exists) → Form validates
3. User fills optional fields (usage rules, examples, synonyms) → Additional context added
4. System shows potential duplicates → User confirms not a duplicate
5. User submits proposal → Confirmation appears
6. Proposal enters review queue → User can track status

**Success State:** Proposal submitted successfully, user knows it's pending review

**Current Gaps:**
- Form missing examples (good/bad) fields
- Form missing synonyms field

**Navigation Touchpoints:**
- "Propose New Term" button
- Proposal form
- Duplicate detection panel
- Confirmation message

---

### Flow: Review and Approve Proposal

**Role:** Approver (auth required)
**Trigger:** New proposal awaits review
**Starting Point:** Review Queue page

**Steps:**
1. Approver opens Review Queue → Sees pending proposals
2. Approver clicks on proposal → Proposal detail with all fields
3. Approver reviews definition and usage rules → Assesses quality
4. Approver checks for conflicts with existing terms → Ensures no collision
5. Decision point:
   - **Approve:** Term becomes canonical, version created
   - **Reject:** Proposal declined with comment
   - **Request Changes:** Sent back to proposer with feedback
6. System updates status → Proposer notified

**Success State:** Proposal resolved with clear outcome and audit trail

**Future Enhancement:** AI analysis layer recommends related terms/principles during review

**Navigation Touchpoints:**
- Review Queue (sidebar navigation)
- Proposal detail view
- Approve/Reject/Request Changes buttons
- Comment field

---

### Flow: View Version History

**Role:** Any user
**Trigger:** User wants to understand how a term evolved
**Starting Point:** Term detail page

**Steps:**
1. User on term detail clicks "History" tab → Version list appears
2. User sees all versions with dates, authors, change notes → Understands evolution
3. User clicks on a version → Sees snapshot of term at that point
4. User can compare versions → Sees what changed

**Current Gap:** Full version history not yet implemented (only counter exists)

**Navigation Touchpoints:**
- History tab on term detail
- Version list
- Version detail/diff view

---

### Flow: Admin User Management

**Role:** Admin (auth required)
**Trigger:** New employee needs access or role change needed
**Starting Point:** Settings page

**Steps:**
1. Admin navigates to Settings → Settings page loads
2. Admin clicks Team Management tab → User list displays
3. Admin clicks Invite User → Invite dialog opens
4. Admin enters name, email, selects role → Invitation sent
5. Admin can change existing user roles via dropdown

**Success State:** User has appropriate access

**Navigation Touchpoints:**
- Settings in navigation
- Users & Roles tab
- Invite dialog
- Role selector dropdown

---

## Navigation Structure

### Primary Navigation
| Destination | Roles | Auth Required | Frequency |
|-------------|-------|---------------|-----------|
| Home / Dashboard | All | No | High |
| Browse (Categories) | All | No | High |
| Principles | All | No | Medium |
| Proposals | All | No | Medium |
| Review Queue | Approver, Admin | Yes | Medium |
| Settings | Admin | Yes | Low |

### Category Sidebar (on Browse page)
| Destination | Description |
|-------------|-------------|
| All Terms | Complete vocabulary |
| Organizational | Structure and daily business |
| Planning & Execution | Project management |
| Commercial | Client and sales |
| Financial | Billing, costing |
| Cultural | Values and philosophy |
| Methodology | Process and approach |
| Systems | Tool-specific |

### Contextual Actions
| Action | Appears On | Auth Required |
|--------|------------|---------------|
| Propose New Term | Home, Browse (empty), Nav | Yes |
| Propose Edit | Term Detail | Yes |
| Copy Link | Term Detail | No |
| Approve/Reject | Proposal Detail | Yes (Approver+) |
| Edit Category | Settings | Yes (Admin) |

---

## Site Map

```
Katalyst Lexicon
├── Home (Dashboard) [Public]
│   ├── Search bar
│   ├── Recently updated terms
│   └── Propose CTA
│
├── Browse [Public]
│   ├── All Terms
│   └── By Category (7 categories)
│
├── Term Detail [Public]
│   ├── Definition & Usage
│   ├── Examples
│   ├── Related Terms (TO BUILD)
│   ├── Related Principles
│   ├── Version History (TO BUILD)
│   └── Propose Edit [Auth]
│
├── Principles [Public]
│   ├── List
│   └── Principle Detail
│       ├── Full Content
│       └── Related Terms
│
├── Propose [Auth]
│   └── New Term Form
│
├── Review Queue [Auth: Approver+]
│   └── Proposal Review
│
└── Settings [Auth: Admin]
    ├── Users & Roles
    ├── Permissions
    ├── Notifications
    └── Visibility
```

---

*Created: 2026-01-10*
*Validated: 2026-01-10 - Confirmed roles, added auth model, identified gaps*
