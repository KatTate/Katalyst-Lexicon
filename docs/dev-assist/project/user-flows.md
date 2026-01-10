# User Flows

*Extracted from: `attached_assets/Pasted--Design-Document-Katalyst-Lexicon...txt` (Sections 4, 6, 9)*

## Roles

### Role: Member
**Primary Goal:** Find and use correct terminology, propose new terms
**Permission Level:** Browse, search, propose new terms/edits
**Frequency:** Daily (during meetings, content creation)

**Key Actions:**
1. Search for terms - High
2. Browse by category - Medium
3. Propose new term - Low
4. Propose edit to existing term - Low

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

## Flow Narratives

### Flow: Quick Term Lookup (Most Common)

**Role:** Any Member
**Trigger:** User is in a meeting or creating content and needs to confirm terminology
**Starting Point:** Any page (via global search) or Home page

**Steps:**
1. User types in search bar → Search results appear instantly
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

**Role:** Any Member
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
- Breadcrumb back to category

---

### Flow: Propose New Term

**Role:** Member
**Trigger:** User encounters a term that should be in the lexicon but isn't
**Starting Point:** Search results (no results) or Propose button

**Steps:**
1. User clicks "Propose New Term" → Proposal form opens
2. User fills required fields (name, category, definition) → Form validates
3. User fills optional fields (why exists, usage rules, examples) → Additional context added
4. System shows potential duplicates → User confirms not a duplicate
5. User submits proposal → Confirmation appears
6. Proposal enters review queue → User can track status

**Success State:** Proposal submitted successfully, user knows it's pending review

**Navigation Touchpoints:**
- "Propose New Term" button (prominent)
- Proposal form
- Duplicate detection panel
- Confirmation message
- My proposals / proposal tracker

---

### Flow: Review and Approve Proposal

**Role:** Approver
**Trigger:** New proposal awaits review (notification or checking queue)
**Starting Point:** Review Queue page

**Steps:**
1. Approver opens Review Queue → Sees pending proposals
2. Approver clicks on proposal → Proposal detail with all fields
3. Approver reviews definition and usage rules → Assesses quality
4. Approver checks for conflicts with existing terms → Ensures no collision
5. Decision point:
   - **Approve:** Term becomes canonical, appears in lexicon
   - **Reject:** Proposal declined with optional comment
   - **Request Changes:** Sent back to proposer with feedback
6. System updates status → Proposer notified

**Success State:** Proposal resolved with clear outcome and audit trail

**Navigation Touchpoints:**
- Review Queue (sidebar navigation)
- Proposal detail view
- Approve/Reject/Request Changes buttons
- Comment field
- Notification system

---

### Flow: Edit Existing Term

**Role:** Member (propose) → Approver (approve)
**Trigger:** User notices outdated or incorrect information on a term
**Starting Point:** Term detail page

**Steps:**
1. User on term detail clicks "Propose Edit" → Edit form with current values
2. User modifies fields → Changes tracked
3. User adds change note explaining why → Required field
4. User submits edit proposal → Proposal created
5. Edit enters review queue → Approver reviews diff
6. Approver approves → Term version incremented, changes live

**Success State:** Term updated with full audit trail

**Navigation Touchpoints:**
- "Propose Edit" button on term detail
- Edit proposal form
- Change note field
- Diff view for approver
- Version history

---

### Flow: Admin User Management

**Role:** Admin
**Trigger:** New employee needs access or role change needed
**Starting Point:** Settings page

**Steps:**
1. Admin navigates to Settings → Settings page loads
2. Admin clicks Team Management → User list displays
3. Admin clicks Add User or selects existing user → User form/detail
4. Admin sets role (Member/Approver/Admin) → Role assigned
5. Admin saves → User can access system with permissions

**Success State:** User has appropriate access

**Navigation Touchpoints:**
- Settings in navigation
- Team Management section
- User list
- User form/detail
- Role selector

---

## Navigation Structure

### Primary Navigation
| Destination | Roles | Frequency |
|-------------|-------|-----------|
| Home / Dashboard | All | High |
| Browse (Categories) | All | High |
| Search | All | High |
| Proposals | All | Medium |
| Review Queue | Approver, Admin | Medium |
| Principles | All | Low |
| Settings | Admin | Low |

### Secondary Navigation (Sidebar)
| Destination | Roles | Frequency |
|-------------|-------|-----------|
| Category: Organizational | All | Medium |
| Category: Planning & Execution | All | Medium |
| Category: Commercial | All | Medium |
| Category: Financial | All | Medium |
| Category: Cultural | All | Low |
| Category: Methodology | All | Low |
| Category: Systems | All | Low |

### Contextual Actions
| Action | Appears On | Roles |
|--------|------------|-------|
| Propose Edit | Term Detail | All |
| Copy Link | Term Detail | All |
| Approve/Reject | Proposal Detail | Approver, Admin |
| Edit Category | Settings | Admin |

---

## Site Map

```
Katalyst Lexicon
├── Home (Dashboard)
│   ├── Search bar
│   ├── Recent terms
│   └── Quick stats
├── Browse
│   ├── All Terms
│   └── By Category
│       ├── Organizational
│       ├── Planning & Execution
│       ├── Commercial
│       ├── Financial
│       ├── Cultural
│       ├── Methodology
│       └── Systems
├── Term Detail
│   ├── Definition & Usage
│   ├── Examples
│   ├── Version History
│   └── Propose Edit
├── Proposals
│   ├── My Proposals
│   └── New Proposal Form
├── Review Queue (Approver+)
│   └── Proposal Review
├── Principles
│   ├── List
│   └── Principle Detail
└── Settings (Admin)
    ├── Team Management
    ├── Categories
    └── System Settings
```

---

*Created: 2026-01-10*
*Source: Original Design Document (Sections 4, 6, 9)*
