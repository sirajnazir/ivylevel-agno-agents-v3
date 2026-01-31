# Universal Validation Architecture

**Version:** 1.0
**Created:** January 2026
**Status:** Implemented

## Executive Summary

This document describes the Universal Validation Layer - a fail-proof data validation system that ensures no user input ever causes a save failure. The system uses smart inference, intelligent defaults, and LLM-powered fallbacks to handle any input gracefully.

## Core Principles

### 1. Never Fail

```
❌ OLD WAY: throw new Error("Invalid GPA")
✅ NEW WAY: transform → track → continue
```

Every piece of data is transformed to a valid state. We track what was changed for transparency, but we never block the user flow.

### 2. Smart Before Default

```
Priority Order:
1. Use provided value (if valid)
2. Infer from related fields (grade → graduation_year)
3. Apply intelligent default (last resort)
4. Use LLM for ambiguous cases (future)
```

### 3. Confidence Tracking

Every validation produces a confidence score (0.0 - 1.0) that agents can use to adjust their reasoning:

```typescript
{
  data: ProfileV2,
  confidence: 0.85,
  adjustments: [
    { field: "gpa", severity: "capped", reason: "GPA > 5.5, capped at 5.5" }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INPUT                                   │
│  (Assessment Forms, API, Chat, Imports, Third-party Integrations)   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL VALIDATOR                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 1: Type Coercion & Cleanup                              │   │
│  │ "12" → 12, "  MIT  " → "MIT", null → undefined               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 2: Smart Inference                                      │   │
│  │ grade=11 + no graduation_year → graduation_year=2027         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 3: Constraint Relaxation                                │   │
│  │ GPA=4.8 → capped at 5.5, school_type="PUBLIC" → "public"     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 4: Default Application                                  │   │
│  │ empty first_name → "Student"                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VALIDATED OUTPUT                                  │
│  { data: ProfileV2, confidence: 0.85, adjustments: [...] }          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (Relaxed Constraints)                    │
│  - GPA: 0-5.5 (supports weighted)                                   │
│  - Grade: 6-13 (middle school to gap year)                          │
│  - school_type includes 'other'                                      │
│  - Trigger auto-normalizes as safety net                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Files

| File | Purpose |
|------|---------|
| `/frontend/src/lib/validation/universalValidator.ts` | Core validation logic |
| `/frontend/src/lib/services/profileService.ts` | Uses validator for all saves |
| `/backend/database/migrations/007_relax_constraints.sql` | DB constraint relaxation |

## Constraint Mappings

### Current vs. New

| Field | Old Constraint | New Constraint | Reason |
|-------|---------------|----------------|--------|
| `grade` | 9-12 only | 6-13 | Middle school, gap year |
| `graduation_year` | 2024-2032 | 2015-2040 | Avoid hardcoded expiry |
| `gpa` | 0-4.0 | 0-5.5 | Weighted GPAs |
| `school_type` | 5 options | 6 options (+other) | Edge cases |

### School Type Aliases

The validator automatically maps common variations:

```typescript
"PUBLIC" → "public"
"public school" → "public"
"Private" → "private"
"boarding" → "private"
"magnet" → "public"
"parochial" → "private"
"online" → "other"
```

## Usage Examples

### In Assessment Flow

```typescript
import { saveAssessmentToProfile } from '@/lib/services/profileService';

// This will NEVER fail, even with bad data
const success = await saveAssessmentToProfile(userId, {
  firstName: "",           // → "Student" (defaulted)
  grade: "eleven",         // → undefined (can't parse, OK)
  gpa: 4.8,               // → 4.8 (valid in new range)
  schoolType: "BOARDING", // → "private" (mapped)
});
// success === true always (or very rare edge case)
```

### Direct Validation

```typescript
import { validateProfile, validateField } from '@/lib/validation/universalValidator';

// Full profile validation
const result = validateProfile({
  first_name: "",
  gpa: 5.0,
  grade: 15,
});

console.log(result);
// {
//   data: { first_name: "Student", gpa: 5.0, grade: 13, ... },
//   confidence: 0.92,
//   adjustments: [
//     { field: "first_name", severity: "defaulted", ... },
//     { field: "grade", severity: "capped", ... }
//   ]
// }

// Single field validation
const gpaResult = validateField('gpa', 4.5);
// { value: 4.5, adjusted: false }
```

## Confidence Scoring

The confidence score reflects data quality:

| Adjustment Type | Penalty |
|----------------|---------|
| `normalized` | -0.01 |
| `inferred` | -0.03 |
| `defaulted` | -0.05 |
| `capped` | -0.04 |
| `transformed` | -0.06 |
| `llm_assisted` | -0.10 |

Agents can use this score to:
- Adjust their certainty in recommendations
- Request more information if confidence is too low
- Weight results appropriately

## Database Trigger (Safety Net)

Even if somehow invalid data bypasses the application validator, the database has a trigger that auto-normalizes:

```sql
CREATE TRIGGER normalize_profile_before_save
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION normalize_profile_data();
```

This:
- Normalizes school_type to valid values
- Ensures first_name is never empty
- Caps GPA at maximum

## Future Enhancements

### Phase 2: LLM Fallback (Planned)

For truly ambiguous cases, use LLM to infer intent:

```typescript
// User types: "I do robotics stuff at school"
// LLM extracts: spike_category = "RESEARCH" or "CREATE"

const llmResult = await extractFromFreeText(
  "I do robotics stuff at school",
  "spike_category"
);
```

### Phase 3: Semantic Caching

Cache LLM extractions semantically to avoid repeated API calls:

```typescript
// "robotics at school" ≈ "school robotics club" → same cached result
```

## Rollout Plan

1. ✅ **Phase 1** (Complete): Universal Validator + Relaxed Constraints
2. ⏳ **Phase 2** (Next): Backend Python validation mirror
3. 📋 **Phase 3** (Future): LLM fallback for free-text fields

## Testing

```bash
# Run validation tests
cd frontend && npm test -- --grep "universalValidator"

# Test database migration
psql $DATABASE_URL -f backend/database/migrations/007_relax_constraints.sql
```

## Summary

The Universal Validation Layer ensures:

- **No save ever fails** due to data constraints
- **Smart inference** fills gaps where possible
- **Confidence tracking** enables intelligent agent behavior
- **Sparse profiles are OK** - underclassmen with limited data work fine
- **Future-proof** - easy to add new fields and constraints
