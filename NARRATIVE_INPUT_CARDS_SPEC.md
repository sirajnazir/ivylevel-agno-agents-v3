# Narrative Input Cards - Design Spec

**Date**: January 31, 2026
**Purpose**: Add click-based cards to capture passion interests, causes, and values for narrative synthesis
**Constraint**: NO TYPING - clicks, multi-select grids, and sliders only

---

## Overview

Add 3 new cards to Frame 3 (Building) to capture data needed for narrative synthesis:

| Card | Purpose | Pillar | Format |
|------|---------|--------|--------|
| **Passion Interests** | What topics excite them | PASSION | Multi-select grid (pick 2-4) |
| **Causes & Impact** | What they want to change | SERVICE | Multi-select grid (pick 1-3) |
| **Core Values** | What matters to them | IDENTITY | Multi-select grid (pick 3-5) |

---

## Card 1: Passion Interests

**Question**: "What topics light you up?"
**Subtitle**: "Pick 2-4 areas you'd explore even if no one was watching"

### Options (Multi-select, 2-4 required)

```typescript
const PASSION_INTERESTS = [
  // STEM
  { value: 'AI_ML', label: 'AI & Machine Learning', icon: IconRobot, category: 'STEM' },
  { value: 'BIOTECH', label: 'Biotech & Medicine', icon: IconDna, category: 'STEM' },
  { value: 'ENGINEERING', label: 'Engineering & Building', icon: IconTool, category: 'STEM' },
  { value: 'SPACE', label: 'Space & Astronomy', icon: IconRocket, category: 'STEM' },
  { value: 'ENVIRONMENT', label: 'Environment & Climate', icon: IconLeaf, category: 'STEM' },
  { value: 'CS_CODING', label: 'Coding & Software', icon: IconCode, category: 'STEM' },

  // Creative
  { value: 'FILM_MEDIA', label: 'Film & Media', icon: IconVideo, category: 'CREATIVE' },
  { value: 'MUSIC', label: 'Music & Performance', icon: IconMusic, category: 'CREATIVE' },
  { value: 'VISUAL_ART', label: 'Visual Art & Design', icon: IconPalette, category: 'CREATIVE' },
  { value: 'WRITING', label: 'Writing & Storytelling', icon: IconPen, category: 'CREATIVE' },
  { value: 'FASHION', label: 'Fashion & Style', icon: IconShirt, category: 'CREATIVE' },

  // Humanities & Social
  { value: 'PSYCHOLOGY', label: 'Psychology & Mind', icon: IconBrain, category: 'HUMANITIES' },
  { value: 'POLITICS', label: 'Politics & Policy', icon: IconScale, category: 'HUMANITIES' },
  { value: 'HISTORY', label: 'History & Culture', icon: IconBook, category: 'HUMANITIES' },
  { value: 'PHILOSOPHY', label: 'Philosophy & Ethics', icon: IconThink, category: 'HUMANITIES' },
  { value: 'LANGUAGES', label: 'Languages & Communication', icon: IconGlobe, category: 'HUMANITIES' },

  // Business & Impact
  { value: 'ENTREPRENEURSHIP', label: 'Startups & Business', icon: IconBriefcase, category: 'BUSINESS' },
  { value: 'FINANCE', label: 'Finance & Economics', icon: IconChart, category: 'BUSINESS' },
  { value: 'SOCIAL_ENTERPRISE', label: 'Social Enterprise', icon: IconHeart, category: 'BUSINESS' },

  // Other
  { value: 'SPORTS_FITNESS', label: 'Sports & Fitness', icon: IconTrophy, category: 'OTHER' },
  { value: 'GAMING', label: 'Gaming & Esports', icon: IconGamepad, category: 'OTHER' },
  { value: 'FOOD_CULINARY', label: 'Food & Culinary', icon: IconChef, category: 'OTHER' },
];
```

### Data Storage

```typescript
// In useStudentStore
profile.passion.interest_areas: string[]  // ['AI_ML', 'BIOTECH', 'SOCIAL_ENTERPRISE']
```

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔥 What topics light you up?                               │
│     Pick 2-4 areas you'd explore even without homework      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  🤖     │  │  🧬     │  │  🔧     │  │  🚀     │        │
│  │   AI    │  │ Biotech │  │Engineer │  │ Space   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  🎬     │  │  🎵     │  │  🎨     │  │  ✍️     │        │
│  │  Film   │  │ Music   │  │  Art    │  │ Writing │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│  ... (scrollable grid)                                      │
├─────────────────────────────────────────────────────────────┤
│  Selected: AI & ML, Biotech, Social Enterprise    [2-4 ✓]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Card 2: Causes & Impact

**Question**: "What change do you want to see?"
**Subtitle**: "Pick 1-3 causes you'd fight for"

### Options (Multi-select, 1-3 required)

```typescript
const CAUSES = [
  // People
  { value: 'EDUCATION_ACCESS', label: 'Education Access', icon: IconSchool, description: 'Equal learning opportunities' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health', icon: IconBrain, description: 'Wellbeing & awareness' },
  { value: 'HEALTHCARE', label: 'Healthcare Access', icon: IconHeart, description: 'Health for all' },
  { value: 'POVERTY', label: 'Poverty & Hunger', icon: IconHome, description: 'Basic needs for everyone' },
  { value: 'DISABILITY', label: 'Disability & Accessibility', icon: IconAccessibility, description: 'Inclusive world' },
  { value: 'ELDERLY', label: 'Elderly Care', icon: IconUsers, description: 'Supporting seniors' },

  // Society
  { value: 'RACIAL_JUSTICE', label: 'Racial Justice', icon: IconFist, description: 'Equity & fairness' },
  { value: 'GENDER_EQUALITY', label: 'Gender Equality', icon: IconEqual, description: 'Equal opportunities' },
  { value: 'IMMIGRATION', label: 'Immigration & Refugees', icon: IconGlobe, description: 'Welcoming communities' },
  { value: 'LGBTQ', label: 'LGBTQ+ Rights', icon: IconRainbow, description: 'Love & acceptance' },

  // Environment
  { value: 'CLIMATE', label: 'Climate Action', icon: IconLeaf, description: 'Planet protection' },
  { value: 'CONSERVATION', label: 'Wildlife & Conservation', icon: IconTree, description: 'Protecting nature' },
  { value: 'SUSTAINABILITY', label: 'Sustainability', icon: IconRecycle, description: 'Sustainable living' },

  // Tech & Future
  { value: 'DIGITAL_DIVIDE', label: 'Digital Divide', icon: IconWifi, description: 'Tech access for all' },
  { value: 'AI_ETHICS', label: 'AI Ethics', icon: IconShield, description: 'Responsible technology' },
  { value: 'PRIVACY', label: 'Privacy & Security', icon: IconLock, description: 'Digital rights' },

  // Community
  { value: 'YOUTH_EMPOWERMENT', label: 'Youth Empowerment', icon: IconStar, description: 'Young voices matter' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture', icon: IconPalette, description: 'Creative expression' },
  { value: 'CIVIC_ENGAGEMENT', label: 'Civic Engagement', icon: IconVote, description: 'Active citizenship' },
];
```

### Data Storage

```typescript
// In useStudentStore
profile.community.causes: string[]  // ['MENTAL_HEALTH', 'DIGITAL_DIVIDE']
```

### UI Layout

Same grid pattern as Passion Interests, with 1-3 selection limit.

---

## Card 3: Core Values

**Question**: "What do you stand for?"
**Subtitle**: "Pick 3-5 values that define you"

### Options (Multi-select, 3-5 required)

```typescript
const CORE_VALUES = [
  // Achievement
  { value: 'EXCELLENCE', label: 'Excellence', icon: IconStar, description: 'Being the best' },
  { value: 'GROWTH', label: 'Growth', icon: IconTrendUp, description: 'Always improving' },
  { value: 'INNOVATION', label: 'Innovation', icon: IconLightbulb, description: 'New ideas' },
  { value: 'CURIOSITY', label: 'Curiosity', icon: IconSearch, description: 'Seeking answers' },

  // Relationships
  { value: 'FAMILY', label: 'Family', icon: IconHome, description: 'Family first' },
  { value: 'COMMUNITY', label: 'Community', icon: IconUsers, description: 'Together stronger' },
  { value: 'LOYALTY', label: 'Loyalty', icon: IconShield, description: 'Standing by others' },
  { value: 'EMPATHY', label: 'Empathy', icon: IconHeart, description: 'Understanding others' },

  // Character
  { value: 'INTEGRITY', label: 'Integrity', icon: IconCheck, description: 'Doing what\'s right' },
  { value: 'AUTHENTICITY', label: 'Authenticity', icon: IconFingerprint, description: 'Being real' },
  { value: 'COURAGE', label: 'Courage', icon: IconFlame, description: 'Facing fears' },
  { value: 'RESILIENCE', label: 'Resilience', icon: IconMountain, description: 'Bouncing back' },

  // Purpose
  { value: 'IMPACT', label: 'Impact', icon: IconTarget, description: 'Making a difference' },
  { value: 'JUSTICE', label: 'Justice', icon: IconScale, description: 'Fairness for all' },
  { value: 'SERVICE', label: 'Service', icon: IconHandHeart, description: 'Helping others' },
  { value: 'LEGACY', label: 'Legacy', icon: IconCrown, description: 'Lasting contribution' },

  // Lifestyle
  { value: 'CREATIVITY', label: 'Creativity', icon: IconPalette, description: 'Expressing myself' },
  { value: 'FREEDOM', label: 'Freedom', icon: IconWind, description: 'Independence' },
  { value: 'BALANCE', label: 'Balance', icon: IconYinYang, description: 'Harmony in life' },
  { value: 'ADVENTURE', label: 'Adventure', icon: IconCompass, description: 'Exploring new things' },
];
```

### Data Storage

```typescript
// In useStudentStore
profile.identity.core_values: string[]  // ['CURIOSITY', 'IMPACT', 'AUTHENTICITY', 'FAMILY']
```

---

## Implementation Details

### Store Updates (`useStudentStore`)

```typescript
// Add to StudentProfile type
interface StudentProfile {
  // ... existing fields

  passion: {
    // ... existing fields
    interest_areas: string[];  // NEW: ['AI_ML', 'BIOTECH']
  };

  community: {
    // ... existing fields
    causes: string[];  // NEW: ['MENTAL_HEALTH', 'EDUCATION_ACCESS']
  };

  identity: {
    // ... existing fields
    core_values: string[];  // NEW: ['CURIOSITY', 'IMPACT', 'AUTHENTICITY']
  };
}

// Add setters
setInterestAreas: (areas: string[]) => void;
setCauses: (causes: string[]) => void;
setCoreValues: (values: string[]) => void;
```

### Card Position in Frame 3

Insert BEFORE whyPassion and whyService:

```typescript
const CARDS = [
  'spike',           // existing
  'leadership',      // existing
  'commitment',      // existing
  'projects',        // existing
  'bragText',        // existing
  'research',        // existing
  'ecAwards',        // existing
  'community',       // existing
  'highSchool',      // existing
  'passionInterests', // NEW - Card 10
  'causesImpact',     // NEW - Card 11
  'coreValues',       // NEW - Card 12
  'whyPassion',      // existing (now Card 13)
  'whyService',      // existing (now Card 14)
] as const;
```

### Component Structure

Each card follows the same pattern:

```tsx
function PassionInterestsCard() {
  const interestAreas = useStudentStore((s) => s.profile.passion.interest_areas);
  const setInterestAreas = useStudentStore((s) => s.setInterestAreas);

  const toggleInterest = (value: string) => {
    if (interestAreas.includes(value)) {
      setInterestAreas(interestAreas.filter(v => v !== value));
    } else if (interestAreas.length < 4) {
      setInterestAreas([...interestAreas, value]);
    }
  };

  const isValid = interestAreas.length >= 2 && interestAreas.length <= 4;

  return (
    <motion.div ...>
      <Card padding="lg">
        <CardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: BRAND_COLORS.bgCard }}>
              <IconFlame size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                What topics light you up?
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Pick 2-4 areas you'd explore even without homework
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {PASSION_INTERESTS.map((interest) => (
              <SelectableCard
                key={interest.value}
                selected={interestAreas.includes(interest.value)}
                onClick={() => toggleInterest(interest.value)}
                icon={interest.icon}
                label={interest.label}
                disabled={!interestAreas.includes(interest.value) && interestAreas.length >= 4}
              />
            ))}
          </div>

          {/* Selection indicator */}
          <div className="mt-4 flex items-center justify-between">
            <span style={{ color: BRAND_COLORS.textMuted }}>
              Selected: {interestAreas.length}/4
            </span>
            {isValid && <Check className="w-5 h-5" style={{ color: BRAND_COLORS.success }} />}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## Database Schema Updates

```sql
-- Add columns to profiles table (if not using JSONB for entire profile)
-- These may already be in the profile JSONB structure

-- Ensure profile JSONB has these fields:
-- profile.passion.interest_areas: string[]
-- profile.community.causes: string[]
-- profile.identity.core_values: string[]
```

---

## Usage in Narrative Synthesis

The Narrative Agent can now generate narratives even for students without activities:

```typescript
// Before (needed activities)
const narrative = generateNarrative({
  activities: profile.activities,  // Empty for 9th grader!
  awards: profile.awards,          // Empty!
});

// After (uses interests + causes + values)
const narrative = generateNarrative({
  // Activity-based (may be empty for underclassmen)
  activities: profile.activities,
  awards: profile.awards,

  // Interest-based (always available after assessment)
  interest_areas: profile.passion.interest_areas,  // ['AI_ML', 'SOCIAL_ENTERPRISE']
  causes: profile.community.causes,                 // ['MENTAL_HEALTH', 'DIGITAL_DIVIDE']
  core_values: profile.identity.core_values,        // ['CURIOSITY', 'IMPACT']

  // Existing
  spike_category: profile.passion.spike_category,
  major_certainty: profile.major_certainty,
});
```

### Example Narrative Generation

**Input** (9th grader, no activities):
```yaml
interest_areas: ['AI_ML', 'BIOTECH', 'SOCIAL_ENTERPRISE']
causes: ['HEALTHCARE', 'DIGITAL_DIVIDE']
core_values: ['CURIOSITY', 'IMPACT', 'INNOVATION', 'EMPATHY']
spike_category: 'RESEARCH'
major_certainty: 'EXPLORING'
```

**Output Narrative**:
```yaml
pillars_fusion: "AI × Healthcare × Social Impact → Health Tech Innovator"
brand_statement: "Curious researcher exploring how AI can democratize healthcare access for underserved communities"
unique_positioning:
  - "Combines technical AI interest with healthcare mission"
  - "Driven by empathy and desire for impact"
  - "Social enterprise mindset (not just tech for tech's sake)"
```

---

## Summary

| Card | Question | Options | Selection |
|------|----------|---------|-----------|
| **Passion Interests** | "What topics light you up?" | 22 interest areas | Pick 2-4 |
| **Causes & Impact** | "What change do you want to see?" | 19 causes | Pick 1-3 |
| **Core Values** | "What do you stand for?" | 20 values | Pick 3-5 |

All cards are:
- ✅ Click-based (no typing)
- ✅ Multi-select grids
- ✅ Icon-based for visual appeal
- ✅ Frictionless (pick and move on)
- ✅ Works for ALL students (9th-12th grade)
