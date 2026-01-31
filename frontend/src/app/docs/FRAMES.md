# IvyLevel Assessment Frames Guide

**Version:** MVP 1.0.3
**Last Updated:** January 21, 2026 @ 20:15 PST

---

## Overview

The assessment flow consists of 6 frames that gather student information to build a comprehensive profile. Each frame collects specific data points used for:

- Archetype detection
- Spike identification
- Scoring calculations
- Game plan generation

---

## Frame Flow

```
Frame 0 (Entry)
    ↓
Frame 1 (Personal Info)
    ↓
Frame 2 (Academic Interests)
    ↓
Frame 3 (Activities)
    ↓
Frame 4 (Goals)
    ↓
Frame 5 (Superpowers)
    ↓
Frame 6 (Results)
```

---

## Frame Details

### Frame 0: Entry

**Purpose:** Welcome and onboarding
**Collects:** Nothing (informational)
**Next:** Frame 1

---

### Frame 1: Personal Information

**Purpose:** Basic student details
**Collects:**
- First name, last name
- Grade (9-12)
- School name
- Location

**Scoring Impact:** Grade affects opportunity eligibility

---

### Frame 2: Academic Interests

**Purpose:** Understand academic focus
**Collects:**
- Intended major
- Academic strengths
- Favorite subjects
- AP/Honors courses

**Scoring Impact:**
- Contributes to archetype detection
- Influences program matching

---

### Frame 3: Activities

**Purpose:** Extracurricular profile
**Collects:**
- Current activities
- Leadership roles
- Time commitment
- Awards/achievements

**Scoring Impact:**
- Activity depth vs breadth
- Leadership indicators
- Spike potential

---

### Frame 4: Goals

**Purpose:** Aspirations and targets
**Collects:**
- Target colleges
- Career interests
- Short-term goals
- Long-term vision

**Scoring Impact:**
- School selectivity tier
- Goal alignment
- Motivation indicators

---

### Frame 5: Superpowers

**Purpose:** Identify unique strengths
**Collects:**
- Self-identified strengths
- What makes them unique
- Passion areas
- Skills

**Scoring Impact:**
- Primary spike identification
- Archetype confirmation
- Narrative themes

---

### Frame 6: Results

**Purpose:** Show assessment results
**Displays:**
- Overall score
- Archetype
- Spike narrative
- Strengths/areas to develop
- Recommended next steps

**Actions:**
- View full results
- Generate game plan
- Go to dashboard

---

## Data Flow

```
Frame Input → Assessment Store → Supabase → Profile Table
                    ↓
            Scoring Engine
                    ↓
            Archetype Detection
                    ↓
            Spike Narrative
```

---

## Scoring Engine

### Score Categories

| Category | Weight | Source |
|----------|--------|--------|
| Academic | 25% | Frame 2 |
| Activities | 25% | Frame 3 |
| Goals | 20% | Frame 4 |
| Uniqueness | 30% | Frame 5 |

### Archetype Detection

Based on response patterns, one of these archetypes is assigned:

| Archetype | Indicators |
|-----------|------------|
| `academic_perfectionist` | High GPA focus, research interest |
| `stem_innovator` | STEM subjects, technical projects |
| `creative_storyteller` | Arts, writing, media focus |
| `future_founder` | Business, leadership, entrepreneurship |
| `global_changemaker` | Service, social impact, community |
| `athletic_scholar` | Sports, NCAA aspirations |

---

## Component Files

| Frame | Component | Location |
|-------|-----------|----------|
| 0 | Frame0 | `/components/frames/Frame0.tsx` |
| 1 | Frame1 | `/components/frames/Frame1.tsx` |
| 2 | Frame2 | `/components/frames/Frame2.tsx` |
| 3 | Frame3 | `/components/frames/Frame3.tsx` |
| 4 | Frame4 | `/components/frames/Frame4.tsx` |
| 5 | Frame5 | `/components/frames/Frame5.tsx` |
| 6 | Frame6 | `/components/frames/Frame6.tsx` |

---

## State Management

### Assessment Store

```typescript
import { useAssessmentStore } from '@/lib/store/assessment'

// Get current frame
const frame = useAssessmentStore((s) => s.currentFrame)

// Get responses
const responses = useAssessmentStore((s) => s.responses)

// Update response
const setResponse = useAssessmentStore((s) => s.setResponse)
setResponse('frame2', { major: 'Computer Science' })

// Navigate
const nextFrame = useAssessmentStore((s) => s.nextFrame)
nextFrame()
```

---

## Styling Guidelines

### Frame Container

```tsx
<div style={{
  backgroundColor: BRAND_COLORS.bgPrimary,
  padding: '2rem',
  borderRadius: '12px'
}}>
  {/* Frame content */}
</div>
```

### Progress Indicator

Each frame shows progress (e.g., "Step 2 of 6")

### Navigation

- Back button (except Frame 0)
- Next/Continue button
- Skip option (where appropriate)

---

## Testing Frames

### Manual Testing

1. Start fresh: Clear localStorage
2. Navigate to `/assessment`
3. Complete each frame
4. Verify data saves to Supabase
5. Check scores calculate correctly

### E2E Tests

Located in `/_archive/code/e2e/` (historical)
New tests should go in `/tests/`
