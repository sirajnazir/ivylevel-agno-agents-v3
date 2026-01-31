# Assessment Agent - Systematic 4-Step Analysis

**Date**: January 31, 2026
**Purpose**: Document the implementation gap between old and new projects, propose Four Pillar Synthesis enhancement
**Key Constraint**: MUST NOT break Agno autonomous multi-agent architecture

---

## Step 1: How OLD Project Implements Assessment/Narrative

### Data Sources (3 Layers)
The old project uses **three complementary data hooks**:

| Hook | Source | Data Provided |
|------|--------|---------------|
| `useProfileIdentity` | Supabase RPC `get_profile_identity` | brandStatement, narrativeDna, narrativeThemes, spike, pillars, archetypeName, identitySynthesis, narrativeConfidence |
| `useNarrativeDNA` | API endpoint (for regeneration) | dna, themes, confidence, rationale |
| `useResultsStore` | Zustand store | identity_synthesis (fallback for archetype) |

### Key Data Points Displayed
From `/components/agents/cards/AssessmentAgentCard.tsx` (lines 26-83):

```typescript
// v5.2: Primary data source - Database via useProfileIdentity
const { data: identity } = useProfileIdentity(profileId);

// Data extracted:
const brandStatement = identity?.brandStatement || narrativeData?.rationale || '';
const narrativeDna = identity?.narrativeDna || narrativeData?.dna || '';
const themes = identity?.narrativeThemes || narrativeData?.themes || [];
const confidence = identity?.narrativeConfidence || narrativeData?.confidence || 0;
const archetypeName = identity?.archetypeName || identity_synthesis?.archetype;

// Detail view includes:
const combinedData = {
  brandStatement,
  narrativeDna,
  themes,
  confidence,
  archetypeName,
  identity_synthesis: identity?.identitySynthesis || identity_synthesis,
  spike: identity?.spike,
  pillars: identity?.pillars,  // <-- FOUR PILLARS!
};
```

### ProfileIdentity Interface (from `useProfileIdentity.ts`)
```typescript
interface ProfileIdentity {
  // Archetype
  archetypeName: string | null;
  archetypeConfidence: number;

  // Identity fields (RICH DATA!)
  brandStatement: string;        // "North Star" - synthesized identity
  narrativeDna: string;          // Core narrative essence
  narrativeThemes: string[];     // Themes (max 3 displayed)
  firstPrinciple: string;        // Core principle
  spike: string;                 // Academic spike
  spikeConfidence: number;
  pillars: string[];             // THE FOUR PILLARS
  identitySynthesis: Record<string, unknown>;  // Full synthesis object
  narrativeConfidence: number;
}
```

### UI Display (AssessmentAgentCard)
1. **Brand Statement** - Primary display (italic, quoted)
2. **Narrative DNA** - Fallback if no brand statement
3. **Themes** - Up to 3 theme pills
4. **ArchetypeBadge** - Visual archetype indicator
5. **Confidence Bar** - Color-coded (green/yellow/red)

### Key Insight
The old project's power comes from:
- **Database-first approach** (`get_profile_identity` RPC)
- **Rich identity data** stored in profiles table
- **Four Pillars** available as `pillars: string[]`
- **Identity Synthesis** as a full object for detailed view

---

## Step 2: How NEW Project Currently Implements

### Data Source (Single Layer)
From `/frontend/src/components/dashboard/MultiAgentTab.tsx` (lines 101-147):

```typescript
// ONLY ONE HOOK!
const { data, isLoading, isError, error, refetch } = useAssessmentEnhancement(profileId);

// Data structure returned (from useAgentData.ts lines 143-166):
{
  narrative_dna: string,        // Basic narrative
  archetype: {
    label: string,
    confidence: number
  } | null,
  cri: number                   // Context Relativity Index
}
```

### API Call (agnoClient.ts)
```typescript
synthesizeNarrative: (profileId: string) =>
    agnoFetch('/agents/narrative/synthesize', { profile_id: profileId }),
```

### UI Display (AssessmentSection)
1. **NarrativeDNACard** - Uses `data.narrative_dna` (compact mode)
2. **Archetype Badge** - Label + confidence bar
3. **CRI Score** - Context Relativity Index

### What's MISSING vs Old Project

| Feature | Old Project | New Project | Gap |
|---------|-------------|-------------|-----|
| Brand Statement | ✅ `brandStatement` | ❌ Not available | **CRITICAL** |
| Narrative DNA | ✅ Rich from DB | ⚠️ From API only | Partial |
| Four Pillars | ✅ `pillars[]` | ❌ Not available | **CRITICAL** |
| Spike | ✅ `spike` | ❌ Not available | Missing |
| Identity Synthesis | ✅ Full object | ❌ Not available | Missing |
| Themes | ✅ `narrativeThemes[]` | ❌ Not available | Missing |
| First Principle | ✅ `firstPrinciple` | ❌ Not available | Missing |
| Confidence | ✅ `narrativeConfidence` | ⚠️ archetype.confidence only | Partial |

### Root Cause of Gap
The new project's `useAssessmentEnhancement` hook:
1. Only calls the Agno backend's `/agents/narrative/synthesize`
2. Does NOT read from `useProfileIdentity` or database
3. Returns thin data structure without Four Pillar context

---

## Step 3: Proposed Solution - Four Pillar Synthesis Enhancement

### Philosophy (Per User's Vision)
> "Brand statement is the North Star that guides ALL downstream agents. Must weave together:
> - **Aptitude** (STEM baseline - expected, not differentiating)
> - **Passion** (NON-technical - key insight! Can be anything except cookie-cutter)
> - **Community** (service cause, impact, DEI elements)
> - **Identity** (background, culture, authentic story)"

### Proposal: Hybrid Data Fetching for AssessmentSection

**Option A: Add `useProfileIdentity` to new project (RECOMMENDED)**

Create `/frontend/src/hooks/useProfileIdentity.ts` - port from old project:

```typescript
// NEW FILE - Port from old project
export function useProfileIdentity(profileId: string | null) {
  return useQuery({
    queryKey: ['profile', 'identity', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // Call Supabase RPC (same as old project)
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .rpc('get_profile_identity', { p_profile_id: profileId });

      if (error || !data?.length) return null;
      return transformDbRow(data[0]);
    },
    enabled: !!profileId,
    staleTime: 30 * 1000,
  });
}
```

**Modify AssessmentSection to use hybrid approach:**

```typescript
function AssessmentSection({ profileId, onViewDetails }) {
  // PRIMARY: Database identity (Four Pillars, Brand Statement)
  const { data: identity, isLoading: identityLoading } = useProfileIdentity(profileId);

  // SECONDARY: Agno backend (for CRI, real-time enhancements)
  const { data: agnoData, isLoading: agnoLoading } = useAssessmentEnhancement(profileId);

  // MERGE: Prefer DB data, enhance with Agno insights
  const mergedData = {
    brandStatement: identity?.brandStatement || agnoData?.narrative_dna || '',
    narrativeDna: identity?.narrativeDna || '',
    pillars: identity?.pillars || [],
    spike: identity?.spike || '',
    themes: identity?.narrativeThemes || [],
    archetype: {
      name: identity?.archetypeName || agnoData?.archetype?.label || '',
      confidence: identity?.archetypeConfidence || agnoData?.archetype?.confidence || 0,
    },
    cri: agnoData?.cri || 0,
    identitySynthesis: identity?.identitySynthesis || {},
    confidence: identity?.narrativeConfidence || 0,
  };

  // ... rest of component using mergedData
}
```

### UI Enhancements

Update AssessmentSection display to show Four Pillars:

```tsx
{/* Four Pillars Display */}
{mergedData.pillars?.length > 0 && (
  <div className="bg-white rounded-lg p-3 border">
    <div className="flex items-center gap-2 mb-2">
      <Layers className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-medium">Identity Pillars</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {mergedData.pillars.map((pillar, i) => (
        <div key={i} className="px-2 py-1 bg-purple-50 rounded text-xs text-purple-700">
          {pillar}
        </div>
      ))}
    </div>
  </div>
)}

{/* Brand Statement - Primary Display */}
{mergedData.brandStatement && (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
    <p className="text-xs font-medium text-purple-600 mb-2">Brand Statement</p>
    <p className="text-sm italic text-gray-700">"{mergedData.brandStatement}"</p>
  </div>
)}
```

---

## Step 4: Evidence This Won't Break Agno Architecture

### Architecture Preservation Proof

| Concern | Resolution | Evidence |
|---------|------------|----------|
| Agent Autonomy | ✅ PRESERVED | We're adding a frontend data layer, NOT modifying agent behavior |
| Backend Calls | ✅ PRESERVED | `useAssessmentEnhancement` still calls Agno backend |
| Orchestration | ✅ UNTOUCHED | No changes to `/agents/narrative/synthesize` endpoint |
| Data Flow | ✅ ADDITIVE | Adding database read, not replacing Agno response |

### What We're NOT Doing
- ❌ NOT modifying any Python agent code
- ❌ NOT changing orchestration logic
- ❌ NOT altering Agno API contracts
- ❌ NOT breaking the "Antigravity" pattern

### What We ARE Doing
- ✅ Adding a frontend hook (`useProfileIdentity`)
- ✅ Enriching UI display with database data
- ✅ Merging DB + Agno data at the React component level
- ✅ Following existing pattern from old project (proven stable)

### Separation of Concerns

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
│  ┌─────────────────┐    ┌─────────────────────────────────┐   │
│  │useProfileIdentity│    │   useAssessmentEnhancement     │   │
│  │   (NEW HOOK)     │    │      (EXISTING HOOK)           │   │
│  └────────┬─────────┘    └──────────────┬─────────────────┘   │
│           │                             │                      │
│           ▼                             ▼                      │
│  ┌─────────────────┐    ┌─────────────────────────────────┐   │
│  │  Supabase RPC   │    │        agnoClient.ts            │   │
│  │get_profile_identity│  │   /agents/narrative/synthesize  │   │
│  └────────┬─────────┘    └──────────────┬─────────────────┘   │
└───────────│──────────────────────────────│─────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────┐           ┌─────────────────────────────────┐
│   SUPABASE DB   │           │      AGNO PYTHON BACKEND        │
│  (profiles table)│           │   (Autonomous Agent Layer)      │
│                 │           │                                  │
│ • brand_statement│           │  ┌─────────────────────────┐   │
│ • narrative_dna  │           │  │  Assessment Orchestrator │   │
│ • pillars        │           │  │  (assessment.py)         │   │
│ • spike          │           │  └─────────────────────────┘   │
│ • themes         │           │            ▲                    │
│                 │           │            │ UNCHANGED          │
└─────────────────┘           │  ┌─────────────────────────┐   │
                              │  │   Narrative Specialist   │   │
                              │  │   (narrative.py)         │   │
                              │  └─────────────────────────┘   │
                              └─────────────────────────────────┘
```

### Risk Assessment

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Supabase RPC fails | Low | Graceful fallback to Agno-only data |
| Double data fetching | Medium | Stale times configured appropriately |
| Data inconsistency | Low | DB is source of truth, Agno enhances |
| Performance impact | Low | Parallel queries, React Query caching |

### Testing Plan

1. **Unit Test**: `useProfileIdentity` hook returns expected data
2. **Integration Test**: AssessmentSection renders with merged data
3. **Fallback Test**: UI works when only Agno data available
4. **E2E Test**: Full flow from login to Assessment card display

---

## Implementation Files to Create/Modify

### DISCOVERY: Infrastructure Already Exists!

The new project already has:
- ✅ `/frontend/src/hooks/useProfileIdentity.ts` - Already exists!
- ✅ `/frontend/src/lib/types/profileIdentity.ts` - Type definition exists!
- ✅ Reads from `identity_synthesis` and `four_pillars` columns

**The only missing piece**: `AssessmentSection` in `MultiAgentTab.tsx` doesn't USE `useProfileIdentity`.

### Modified Files (ONLY ONE FILE NEEDED)
1. `/frontend/src/components/dashboard/MultiAgentTab.tsx`
   - Import `useProfileIdentity` from existing hook
   - Update `AssessmentSection` to merge DB + Agno data
   - Add Four Pillars display
   - Add Brand Statement as primary display

---

## Summary

| Step | Status | Key Finding |
|------|--------|-------------|
| 1. Old Implementation | ✅ Analyzed | Rich data from DB via `useProfileIdentity` + 3 data sources |
| 2. New Implementation | ✅ Analyzed | Thin data from Agno API only, missing Four Pillars |
| 3. Proposed Solution | ✅ Designed | Hybrid approach: DB + Agno merge at frontend |
| 4. Architecture Safety | ✅ Verified | Frontend-only changes, Agno layer untouched |

**Recommendation**: Proceed with implementation. This is a frontend-only enhancement that enriches the UI without touching the autonomous agent architecture.

---

## IMPLEMENTATION COMPLETE (January 31, 2026)

### Changes Made

1. **Archived unused file**:
   - Moved `/components/tabs/MultiAgentsTab.tsx` to `/_archive/unused_components/`
   - Updated `/components/tabs/index.ts` to remove dead export

2. **Updated `/components/dashboard/MultiAgentTab.tsx`**:
   - Added `useProfileIdentity` import (line 20)
   - Rewrote `AssessmentSection` with hybrid approach:
     - Fetches from DB via `useProfileIdentity` (brand statement, pillars, themes)
     - Fetches from Agno API via `useAssessmentEnhancement` (CRI, real-time data)
     - Merges both data sources for rich display

3. **Fixed `/hooks/useProfileIdentity.ts`**:
   - Fixed `usePrefetchProfileIdentity` function that referenced undefined `transformDbRow`

### New UI Elements in Assessment Card

- **Brand Statement** - Primary display with gradient background
- **Four Pillars** - Displayed as amber-colored pills
- **Themes** - Purple rounded pills (max 3)
- **Archetype** - Name + confidence bar
- **CRI** - Context Relativity Index from Agno

### Architecture Integrity

✅ Agno backend UNTOUCHED
✅ Agent orchestration PRESERVED
✅ Frontend-only changes
✅ Hybrid data approach (DB + API)
≠