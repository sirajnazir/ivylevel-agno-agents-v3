# Profile V2 Migration Handover Package

**Version:** 1.0
**Date:** January 30, 2026
**Target:** New Coding Agent
**Scope:** Clean-slate profile schema redesign for progressive enrichment

---

## Executive Summary

The current profile schema loses 94% of assessment data because critical fields are missing. This document provides a complete implementation guide for a new profile schema that:

1. **Supports Progressive Enrichment** - Data grows over 2-4 year student journey
2. **Handles Underclassmen** - Empty portfolios for 9th-10th graders is normal
3. **Enables Narrative Synthesis** - All primitives for Day 1 value delivery
4. **Agent-Friendly** - Each agent has its own workspace namespace

**IMPORTANT:** No data migration needed - delete existing data and start clean.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Design Principles](#2-design-principles)
3. [New Schema Design](#3-new-schema-design)
4. [SQL Implementation](#4-sql-implementation)
5. [TypeScript Types](#5-typescript-types)
6. [Pydantic Models](#6-pydantic-models)
7. [Assessment Frame Mapping](#7-assessment-frame-mapping)
8. [API Routes](#8-api-routes)
9. [Frontend Service Updates](#9-frontend-service-updates)
10. [Agent Integration](#10-agent-integration)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Problem Statement

### Current State (Broken)

```
Assessment Frames 1-12 collect rich data:
- Basic Info (name, grade, graduation year)
- Academic Profile (GPA, SAT/ACT, AP courses)
- Target Schools (dream, reach, target, safety)
- Identity Synthesis (archetype, spike, pillars)
- Activities, Awards, Programs (existing portfolio)
- Interests, Values, Goals

But only 5 fields persist to profiles table:
- firstName, lastName, grade, graduationYear, targetMajor

Result: 94% data loss. Agents receive NULL for critical fields.
```

### Debug Output Showing the Problem

```
=== Profile Data Check ===
target_schools: null        ← Should have school list
gpa: null                   ← Should have GPA
sat_score: null             ← Should have SAT
identity_synthesis: null    ← Should have archetype/spike/pillars
```

---

## 2. Design Principles

### 2.1 Progressive Enrichment Model

```
FRESHMAN (Grade 9)           SENIOR (Grade 12)
├─ name ✓                    ├─ name ✓
├─ grade ✓                   ├─ grade ✓
├─ interests ✓               ├─ interests ✓
├─ values ✓                  ├─ values ✓
├─ activities: []            ├─ activities: [10 items]
├─ awards: []                ├─ awards: [5 items]
├─ programs: []              ├─ programs: [3 items]
└─ gpa: null                 └─ gpa: 3.95

Both are VALID profiles. Empty portfolio ≠ incomplete profile.
```

### 2.2 Required vs Optional Fields

**Only 4 fields are truly required:**
1. `id` (UUID, auto-generated)
2. `user_id` (from auth)
3. `first_name`
4. `created_at`

**Everything else is optional** with sensible defaults or null.

### 2.3 Storage Strategy

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Frequently queried | Flat columns | Indexable, fast queries |
| Complex nested | JSONB | Flexible, schema-evolution friendly |
| Agent outputs | JSONB namespaces | Isolated, conflict-free |

### 2.4 Source Tracking

Every computed field tracks its origin:
```json
{
  "value": "STEM Innovator",
  "_source": "assessment",
  "_source_agent": "assessment_agent",
  "_updated_at": "2026-01-30T10:00:00Z"
}
```

---

## 3. New Schema Design

### 3.1 Column Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                     profiles_v2 table                           │
├─────────────────────────────────────────────────────────────────┤
│ IDENTITY (Required)                                             │
│   id, user_id, first_name, created_at                          │
├─────────────────────────────────────────────────────────────────┤
│ BASIC INFO (Optional, Flat)                                     │
│   last_name, grade, graduation_year, email, phone              │
├─────────────────────────────────────────────────────────────────┤
│ ACADEMIC (Optional, Flat - Indexed)                             │
│   gpa, sat_score, act_score, class_rank                        │
├─────────────────────────────────────────────────────────────────┤
│ TARGETS (JSONB)                                                 │
│   target_schools: {dream:[], reach:[], target:[], safety:[]}   │
│   target_majors: string[]                                       │
├─────────────────────────────────────────────────────────────────┤
│ IDENTITY SYNTHESIS (JSONB) - Core for Narrative                │
│   archetype, spike, pillars, confidence, brand_statement       │
├─────────────────────────────────────────────────────────────────┤
│ PORTFOLIO (JSONB Arrays)                                        │
│   activities: ActivityItem[]                                    │
│   awards: AwardItem[]                                           │
│   programs: ProgramItem[]                                       │
│   courses: CourseItem[]                                         │
├─────────────────────────────────────────────────────────────────┤
│ ASSESSMENT PRIMITIVES (JSONB)                                   │
│   interests, values, goals, strengths, challenges              │
├─────────────────────────────────────────────────────────────────┤
│ AGENT WORKSPACES (JSONB)                                        │
│   agent_outputs: {ec: {...}, awards: {...}, programs: {...}}   │
├─────────────────────────────────────────────────────────────────┤
│ COMPUTED SCORES (Flat - Indexed)                                │
│   ivy_score, narrative_score, portfolio_score                  │
├─────────────────────────────────────────────────────────────────┤
│ METADATA                                                        │
│   updated_at, assessment_completed_at, onboarding_step         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. SQL Implementation

### 4.1 Drop Existing and Create New

```sql
-- ============================================================================
-- PROFILE V2 SCHEMA - CLEAN SLATE
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing profiles table (dev/test data only)
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create new profiles table
CREATE TABLE profiles (
    -- ========== IDENTITY (Required) ==========
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========== BASIC INFO (Optional) ==========
    last_name TEXT,
    email TEXT,
    phone TEXT,
    grade INTEGER CHECK (grade >= 9 AND grade <= 12),
    graduation_year INTEGER CHECK (graduation_year >= 2024 AND graduation_year <= 2032),
    school_name TEXT,
    school_type TEXT CHECK (school_type IN ('public', 'private', 'charter', 'homeschool', 'international')),
    location_state TEXT,
    location_country TEXT DEFAULT 'USA',

    -- ========== ACADEMIC (Flat, Indexed) ==========
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    gpa_scale DECIMAL(3,1) DEFAULT 4.0,
    gpa_weighted DECIMAL(3,2),
    sat_score INTEGER CHECK (sat_score >= 400 AND sat_score <= 1600),
    act_score INTEGER CHECK (act_score >= 1 AND act_score <= 36),
    class_rank INTEGER,
    class_size INTEGER,

    -- ========== TARGETS (JSONB) ==========
    -- Structure: {dream: string[], reach: string[], target: string[], safety: string[]}
    target_schools JSONB DEFAULT '{"dream": [], "reach": [], "target": [], "safety": []}'::jsonb,
    target_majors TEXT[] DEFAULT '{}',

    -- ========== IDENTITY SYNTHESIS (JSONB) - Core for Narrative ==========
    -- Structure: {archetype: {id, name, confidence}, spike: string, pillars: {...}, brand_statement: string}
    identity_synthesis JSONB DEFAULT '{}'::jsonb,

    -- ========== PORTFOLIO (JSONB Arrays) ==========
    -- These start empty for underclassmen - that's normal!
    activities JSONB DEFAULT '[]'::jsonb,
    awards JSONB DEFAULT '[]'::jsonb,
    programs JSONB DEFAULT '[]'::jsonb,
    courses JSONB DEFAULT '[]'::jsonb,

    -- ========== ASSESSMENT PRIMITIVES (JSONB) ==========
    -- Raw inputs from assessment frames - used by agents
    interests JSONB DEFAULT '[]'::jsonb,
    values JSONB DEFAULT '[]'::jsonb,
    goals JSONB DEFAULT '{}'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    challenges JSONB DEFAULT '[]'::jsonb,

    -- ========== FOUR PILLARS (JSONB) ==========
    -- Structure: {identity: {...}, aptitude: {...}, passion: {...}, service: {...}}
    four_pillars JSONB DEFAULT '{}'::jsonb,

    -- ========== AGENT WORKSPACES (JSONB) ==========
    -- Each agent writes to its own namespace to prevent conflicts
    -- Structure: {ec: {...}, awards: {...}, programs: {...}, assessment: {...}, gameplan: {...}}
    agent_outputs JSONB DEFAULT '{}'::jsonb,

    -- ========== COMPUTED SCORES (Flat, Indexed) ==========
    ivy_score DECIMAL(5,2) CHECK (ivy_score >= 0 AND ivy_score <= 100),
    narrative_score DECIMAL(5,2) CHECK (narrative_score >= 0 AND narrative_score <= 100),
    portfolio_score DECIMAL(5,2) CHECK (portfolio_score >= 0 AND portfolio_score <= 100),
    readiness_level TEXT CHECK (readiness_level IN ('emerging', 'developing', 'competitive', 'exceptional')),

    -- ========== METADATA ==========
    updated_at TIMESTAMPTZ DEFAULT now(),
    assessment_completed_at TIMESTAMPTZ,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,

    -- ========== CONSTRAINTS ==========
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Step 3: Create indexes for common queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_grade ON profiles(grade);
CREATE INDEX idx_profiles_graduation_year ON profiles(graduation_year);
CREATE INDEX idx_profiles_ivy_score ON profiles(ivy_score);
CREATE INDEX idx_profiles_gpa ON profiles(gpa);
CREATE INDEX idx_profiles_sat_score ON profiles(sat_score);

-- GIN indexes for JSONB array searches
CREATE INDEX idx_profiles_target_schools ON profiles USING GIN (target_schools);
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests);
CREATE INDEX idx_profiles_identity_synthesis ON profiles USING GIN (identity_synthesis);

-- Step 4: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can do anything (for backend agents)
CREATE POLICY "Service role full access"
    ON profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Step 6: Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Helper function to upsert profile
CREATE OR REPLACE FUNCTION upsert_profile(
    p_user_id UUID,
    p_data JSONB
)
RETURNS profiles AS $$
DECLARE
    result profiles;
BEGIN
    INSERT INTO profiles (user_id, first_name)
    VALUES (p_user_id, COALESCE(p_data->>'first_name', 'Student'))
    ON CONFLICT (user_id)
    DO UPDATE SET
        first_name = COALESCE(p_data->>'first_name', profiles.first_name),
        last_name = COALESCE(p_data->>'last_name', profiles.last_name),
        grade = COALESCE((p_data->>'grade')::INTEGER, profiles.grade),
        graduation_year = COALESCE((p_data->>'graduation_year')::INTEGER, profiles.graduation_year),
        gpa = COALESCE((p_data->>'gpa')::DECIMAL, profiles.gpa),
        sat_score = COALESCE((p_data->>'sat_score')::INTEGER, profiles.sat_score),
        act_score = COALESCE((p_data->>'act_score')::INTEGER, profiles.act_score),
        target_schools = COALESCE(p_data->'target_schools', profiles.target_schools),
        target_majors = COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(p_data->'target_majors')),
            profiles.target_majors
        ),
        identity_synthesis = COALESCE(p_data->'identity_synthesis', profiles.identity_synthesis),
        activities = COALESCE(p_data->'activities', profiles.activities),
        awards = COALESCE(p_data->'awards', profiles.awards),
        programs = COALESCE(p_data->'programs', profiles.programs),
        interests = COALESCE(p_data->'interests', profiles.interests),
        values = COALESCE(p_data->'values', profiles.values),
        goals = COALESCE(p_data->'goals', profiles.goals),
        four_pillars = COALESCE(p_data->'four_pillars', profiles.four_pillars),
        updated_at = now()
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. TypeScript Types

### 5.1 Create `/frontend/src/lib/types/profile.ts`

```typescript
// =============================================================================
// PROFILE V2 TYPES
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Target Schools Structure
// ─────────────────────────────────────────────────────────────────────────────
export interface TargetSchools {
  dream: string[];    // 1-3 schools (< 10% admission)
  reach: string[];    // 2-4 schools (10-20% admission)
  target: string[];   // 3-5 schools (20-40% admission)
  safety: string[];   // 2-3 schools (> 40% admission)
}

// ─────────────────────────────────────────────────────────────────────────────
// Identity Synthesis (Output of Assessment)
// ─────────────────────────────────────────────────────────────────────────────
export interface Archetype {
  id: string;           // e.g., "stem_innovator", "academic_powerhouse"
  name: string;         // e.g., "STEM Innovator"
  confidence: number;   // 0-1
  description?: string;
}

export interface PillarDetail {
  score: number;              // 0-10
  evidence: string[];         // Supporting activities/achievements
  narrative_hook?: string;    // For essay/interview use
}

export interface FourPillars {
  identity: PillarDetail;     // Who you are at your core
  aptitude: PillarDetail;     // What you're good at
  passion: PillarDetail;      // What drives you
  service: PillarDetail;      // How you give back
}

export interface IdentitySynthesis {
  archetype: Archetype;
  spike: string;              // Unique differentiator
  pillars: FourPillars;
  brand_statement?: string;   // 1-2 sentence narrative
  confidence: number;         // Overall confidence 0-1
  _source?: string;
  _source_agent?: string;
  _updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Items
// ─────────────────────────────────────────────────────────────────────────────
export interface ActivityItem {
  id?: string;
  name: string;
  description: string;
  category: 'academic' | 'athletic' | 'arts' | 'community' | 'work' | 'family' | 'other';
  role: string;
  role_level: 'founder' | 'president' | 'leader' | 'member' | 'participant';
  hours_per_week: number;
  weeks_per_year: number;
  years_active: number[];     // e.g., [9, 10, 11]
  achievements?: string[];
  impact_description?: string;
  is_spike_activity?: boolean;
  _source?: 'user' | 'agent';
}

export interface AwardItem {
  id?: string;
  name: string;
  organization: string;
  level: 'international' | 'national' | 'state' | 'regional' | 'school';
  year_received: number;
  description?: string;
  _source?: 'user' | 'agent';
}

export interface ProgramItem {
  id?: string;
  name: string;
  organization: string;
  type: 'summer' | 'research' | 'internship' | 'online' | 'competition';
  year: number;
  duration_weeks?: number;
  selectivity?: 'highly_selective' | 'selective' | 'competitive' | 'open';
  description?: string;
  _source?: 'user' | 'agent';
}

export interface CourseItem {
  name: string;
  type: 'AP' | 'IB' | 'Honors' | 'DE' | 'Regular';
  subject: string;
  grade?: string;
  year: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assessment Primitives
// ─────────────────────────────────────────────────────────────────────────────
export interface Interest {
  area: string;
  level: 'curious' | 'engaged' | 'passionate' | 'expert';
  related_activities?: string[];
}

export interface Value {
  value: string;
  importance: number;  // 1-5
  example?: string;
}

export interface Goals {
  short_term: string[];   // This year
  medium_term: string[];  // High school
  long_term: string[];    // College and beyond
  dream_outcome?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Workspaces
// ─────────────────────────────────────────────────────────────────────────────
export interface AgentWorkspace {
  last_run?: string;
  output?: Record<string, unknown>;
  quality_score?: number;
  error?: string;
}

export interface AgentOutputs {
  assessment?: AgentWorkspace;
  ec?: AgentWorkspace;
  awards?: AgentWorkspace;
  programs?: AgentWorkspace;
  gameplan?: AgentWorkspace;
  [key: string]: AgentWorkspace | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Type
// ─────────────────────────────────────────────────────────────────────────────
export interface Profile {
  // Identity (Required)
  id: string;
  user_id: string;
  first_name: string;
  created_at: string;

  // Basic Info (Optional)
  last_name?: string;
  email?: string;
  phone?: string;
  grade?: number;
  graduation_year?: number;
  school_name?: string;
  school_type?: 'public' | 'private' | 'charter' | 'homeschool' | 'international';
  location_state?: string;
  location_country?: string;

  // Academic (Optional)
  gpa?: number;
  gpa_scale?: number;
  gpa_weighted?: number;
  sat_score?: number;
  act_score?: number;
  class_rank?: number;
  class_size?: number;

  // Targets
  target_schools?: TargetSchools;
  target_majors?: string[];

  // Identity Synthesis (Core for Narrative)
  identity_synthesis?: IdentitySynthesis;

  // Portfolio (Empty arrays for underclassmen is normal!)
  activities?: ActivityItem[];
  awards?: AwardItem[];
  programs?: ProgramItem[];
  courses?: CourseItem[];

  // Assessment Primitives
  interests?: Interest[];
  values?: Value[];
  goals?: Goals;
  strengths?: string[];
  challenges?: string[];

  // Four Pillars
  four_pillars?: FourPillars;

  // Agent Workspaces
  agent_outputs?: AgentOutputs;

  // Computed Scores
  ivy_score?: number;
  narrative_score?: number;
  portfolio_score?: number;
  readiness_level?: 'emerging' | 'developing' | 'competitive' | 'exceptional';

  // Metadata
  updated_at?: string;
  assessment_completed_at?: string;
  onboarding_step?: number;
  onboarding_completed?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Creation/Update Helpers
// ─────────────────────────────────────────────────────────────────────────────
export type ProfileCreate = Pick<Profile, 'user_id' | 'first_name'> & Partial<Profile>;

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>;

// ─────────────────────────────────────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_TARGET_SCHOOLS: TargetSchools = {
  dream: [],
  reach: [],
  target: [],
  safety: [],
};

export const DEFAULT_PROFILE: Partial<Profile> = {
  target_schools: DEFAULT_TARGET_SCHOOLS,
  target_majors: [],
  activities: [],
  awards: [],
  programs: [],
  courses: [],
  interests: [],
  values: [],
  strengths: [],
  challenges: [],
  onboarding_step: 0,
  onboarding_completed: false,
};
```

---

## 6. Pydantic Models

### 6.1 Create `/backend/agents/schemas/profile_v2.py`

```python
"""
Profile V2 Pydantic Models
Matches TypeScript types and database schema exactly.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# =============================================================================
# TARGET SCHOOLS
# =============================================================================

class TargetSchools(BaseModel):
    dream: List[str] = Field(default_factory=list)
    reach: List[str] = Field(default_factory=list)
    target: List[str] = Field(default_factory=list)
    safety: List[str] = Field(default_factory=list)


# =============================================================================
# IDENTITY SYNTHESIS
# =============================================================================

class Archetype(BaseModel):
    id: str
    name: str
    confidence: float = Field(ge=0.0, le=1.0)
    description: Optional[str] = None


class PillarDetail(BaseModel):
    score: float = Field(ge=0.0, le=10.0)
    evidence: List[str] = Field(default_factory=list)
    narrative_hook: Optional[str] = None


class FourPillars(BaseModel):
    identity: PillarDetail
    aptitude: PillarDetail
    passion: PillarDetail
    service: PillarDetail


class IdentitySynthesis(BaseModel):
    archetype: Archetype
    spike: str
    pillars: FourPillars
    brand_statement: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    _source: Optional[str] = None
    _source_agent: Optional[str] = None
    _updated_at: Optional[str] = None


# =============================================================================
# PORTFOLIO ITEMS
# =============================================================================

class ActivityItem(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: Literal['academic', 'athletic', 'arts', 'community', 'work', 'family', 'other']
    role: str
    role_level: Literal['founder', 'president', 'leader', 'member', 'participant']
    hours_per_week: int = Field(ge=0, le=40)
    weeks_per_year: int = Field(ge=0, le=52)
    years_active: List[int] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    impact_description: Optional[str] = None
    is_spike_activity: bool = False
    _source: Optional[Literal['user', 'agent']] = None


class AwardItem(BaseModel):
    id: Optional[str] = None
    name: str
    organization: str
    level: Literal['international', 'national', 'state', 'regional', 'school']
    year_received: int
    description: Optional[str] = None
    _source: Optional[Literal['user', 'agent']] = None


class ProgramItem(BaseModel):
    id: Optional[str] = None
    name: str
    organization: str
    type: Literal['summer', 'research', 'internship', 'online', 'competition']
    year: int
    duration_weeks: Optional[int] = None
    selectivity: Optional[Literal['highly_selective', 'selective', 'competitive', 'open']] = None
    description: Optional[str] = None
    _source: Optional[Literal['user', 'agent']] = None


class CourseItem(BaseModel):
    name: str
    type: Literal['AP', 'IB', 'Honors', 'DE', 'Regular']
    subject: str
    grade: Optional[str] = None
    year: int


# =============================================================================
# ASSESSMENT PRIMITIVES
# =============================================================================

class Interest(BaseModel):
    area: str
    level: Literal['curious', 'engaged', 'passionate', 'expert']
    related_activities: List[str] = Field(default_factory=list)


class Value(BaseModel):
    value: str
    importance: int = Field(ge=1, le=5)
    example: Optional[str] = None


class Goals(BaseModel):
    short_term: List[str] = Field(default_factory=list)
    medium_term: List[str] = Field(default_factory=list)
    long_term: List[str] = Field(default_factory=list)
    dream_outcome: Optional[str] = None


# =============================================================================
# AGENT WORKSPACES
# =============================================================================

class AgentWorkspace(BaseModel):
    last_run: Optional[str] = None
    output: Optional[Dict[str, Any]] = None
    quality_score: Optional[float] = None
    error: Optional[str] = None


class AgentOutputs(BaseModel):
    assessment: Optional[AgentWorkspace] = None
    ec: Optional[AgentWorkspace] = None
    awards: Optional[AgentWorkspace] = None
    programs: Optional[AgentWorkspace] = None
    gameplan: Optional[AgentWorkspace] = None

    class Config:
        extra = "allow"  # Allow additional agent namespaces


# =============================================================================
# MAIN PROFILE MODEL
# =============================================================================

class ProfileV2(BaseModel):
    """
    Complete profile model matching database schema.
    All fields optional except id, user_id, first_name.
    """
    # Identity (Required)
    id: str
    user_id: str
    first_name: str
    created_at: datetime

    # Basic Info (Optional)
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[int] = Field(None, ge=9, le=12)
    graduation_year: Optional[int] = Field(None, ge=2024, le=2032)
    school_name: Optional[str] = None
    school_type: Optional[Literal['public', 'private', 'charter', 'homeschool', 'international']] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = "USA"

    # Academic (Optional)
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    gpa_scale: Optional[float] = 4.0
    gpa_weighted: Optional[float] = None
    sat_score: Optional[int] = Field(None, ge=400, le=1600)
    act_score: Optional[int] = Field(None, ge=1, le=36)
    class_rank: Optional[int] = None
    class_size: Optional[int] = None

    # Targets
    target_schools: Optional[TargetSchools] = Field(default_factory=TargetSchools)
    target_majors: Optional[List[str]] = Field(default_factory=list)

    # Identity Synthesis
    identity_synthesis: Optional[IdentitySynthesis] = None

    # Portfolio
    activities: Optional[List[ActivityItem]] = Field(default_factory=list)
    awards: Optional[List[AwardItem]] = Field(default_factory=list)
    programs: Optional[List[ProgramItem]] = Field(default_factory=list)
    courses: Optional[List[CourseItem]] = Field(default_factory=list)

    # Assessment Primitives
    interests: Optional[List[Interest]] = Field(default_factory=list)
    values: Optional[List[Value]] = Field(default_factory=list)
    goals: Optional[Goals] = None
    strengths: Optional[List[str]] = Field(default_factory=list)
    challenges: Optional[List[str]] = Field(default_factory=list)

    # Four Pillars
    four_pillars: Optional[FourPillars] = None

    # Agent Workspaces
    agent_outputs: Optional[AgentOutputs] = Field(default_factory=AgentOutputs)

    # Computed Scores
    ivy_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    narrative_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    portfolio_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    readiness_level: Optional[Literal['emerging', 'developing', 'competitive', 'exceptional']] = None

    # Metadata
    updated_at: Optional[datetime] = None
    assessment_completed_at: Optional[datetime] = None
    onboarding_step: int = 0
    onboarding_completed: bool = False

    class Config:
        populate_by_name = True


# =============================================================================
# PROFILE UPDATE MODEL (for PATCH requests)
# =============================================================================

class ProfileUpdate(BaseModel):
    """For partial updates - all fields optional."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[int] = Field(None, ge=9, le=12)
    graduation_year: Optional[int] = Field(None, ge=2024, le=2032)
    school_name: Optional[str] = None
    school_type: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    gpa_scale: Optional[float] = None
    gpa_weighted: Optional[float] = None
    sat_score: Optional[int] = Field(None, ge=400, le=1600)
    act_score: Optional[int] = Field(None, ge=1, le=36)
    class_rank: Optional[int] = None
    class_size: Optional[int] = None
    target_schools: Optional[TargetSchools] = None
    target_majors: Optional[List[str]] = None
    identity_synthesis: Optional[IdentitySynthesis] = None
    activities: Optional[List[ActivityItem]] = None
    awards: Optional[List[AwardItem]] = None
    programs: Optional[List[ProgramItem]] = None
    courses: Optional[List[CourseItem]] = None
    interests: Optional[List[Interest]] = None
    values: Optional[List[Value]] = None
    goals: Optional[Goals] = None
    strengths: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    four_pillars: Optional[FourPillars] = None
    ivy_score: Optional[float] = None
    narrative_score: Optional[float] = None
    portfolio_score: Optional[float] = None
    readiness_level: Optional[str] = None
    assessment_completed_at: Optional[datetime] = None
    onboarding_step: Optional[int] = None
    onboarding_completed: Optional[bool] = None

    class Config:
        extra = "forbid"
```

---

## 7. Assessment Frame Mapping

### 7.1 Frame → Profile Field Mapping

| Frame | User Inputs | Maps To Profile Field |
|-------|-------------|----------------------|
| Frame 1: Welcome | First name, Last name | `first_name`, `last_name` |
| Frame 2: Grade | Grade level, Graduation year | `grade`, `graduation_year` |
| Frame 3: School | School name, Type, Location | `school_name`, `school_type`, `location_state` |
| Frame 4: Academic | GPA, SAT/ACT, Class rank | `gpa`, `sat_score`, `act_score`, `class_rank`, `class_size` |
| Frame 5: Target Schools | Dream/Reach/Target/Safety schools | `target_schools` (JSONB) |
| Frame 6: Majors | Intended majors | `target_majors` (array) |
| Frame 7: Interests | Areas of interest + levels | `interests` (JSONB array) |
| Frame 8: Values | Core values | `values` (JSONB array) |
| Frame 9: Activities | Current activities | `activities` (JSONB array) |
| Frame 10: Awards | Current awards | `awards` (JSONB array) |
| Frame 11: Programs | Programs attended | `programs` (JSONB array) |
| Frame 12: Goals | Short/medium/long term | `goals` (JSONB) |
| **Computed** | After Frame 12 | `identity_synthesis`, `four_pillars`, `ivy_score` |

### 7.2 Assessment Completion Handler

When assessment completes (after Frame 12), the system should:

1. Call the Assessment Agent to compute `identity_synthesis` and `four_pillars`
2. Calculate initial `ivy_score`
3. Set `assessment_completed_at = now()`
4. Set `onboarding_completed = true`

---

## 8. API Routes

### 8.1 Update `/backend/api/routes/profiles.py`

```python
"""
Profile API Routes - V2
Handles profile CRUD with new schema.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from backend.agents.schemas.profile_v2 import ProfileV2, ProfileUpdate
from backend.tools.database import get_supabase_client

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("/{user_id}", response_model=ProfileV2)
async def get_profile(user_id: str):
    """Get profile by user_id."""
    supabase = get_supabase_client()

    result = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data


@router.post("/", response_model=ProfileV2)
async def create_profile(user_id: str, first_name: str):
    """Create new profile."""
    supabase = get_supabase_client()

    data = {
        "user_id": user_id,
        "first_name": first_name,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = supabase.table("profiles").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create profile")

    return result.data[0]


@router.patch("/{user_id}", response_model=ProfileV2)
async def update_profile(user_id: str, updates: ProfileUpdate):
    """
    Update profile fields.
    Only non-None fields in updates will be applied.
    """
    supabase = get_supabase_client()

    # Filter out None values
    update_data = {k: v for k, v in updates.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Handle JSONB fields that need special serialization
    jsonb_fields = [
        'target_schools', 'identity_synthesis', 'activities',
        'awards', 'programs', 'courses', 'interests', 'values',
        'goals', 'four_pillars', 'agent_outputs'
    ]

    for field in jsonb_fields:
        if field in update_data and update_data[field] is not None:
            if hasattr(update_data[field], 'dict'):
                update_data[field] = update_data[field].dict()

    result = supabase.table("profiles").update(update_data).eq("user_id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data[0]


@router.post("/{user_id}/save-assessment")
async def save_assessment_data(user_id: str, frame_data: dict):
    """
    Save assessment frame data to profile.
    Maps frame outputs to correct profile fields.
    """
    supabase = get_supabase_client()

    # Map frame data to profile fields
    profile_updates = {}

    # Basic info
    if "firstName" in frame_data:
        profile_updates["first_name"] = frame_data["firstName"]
    if "lastName" in frame_data:
        profile_updates["last_name"] = frame_data["lastName"]
    if "grade" in frame_data:
        profile_updates["grade"] = int(frame_data["grade"])
    if "graduationYear" in frame_data:
        profile_updates["graduation_year"] = int(frame_data["graduationYear"])

    # School info
    if "schoolName" in frame_data:
        profile_updates["school_name"] = frame_data["schoolName"]
    if "schoolType" in frame_data:
        profile_updates["school_type"] = frame_data["schoolType"]
    if "state" in frame_data:
        profile_updates["location_state"] = frame_data["state"]

    # Academic
    if "gpa" in frame_data:
        profile_updates["gpa"] = float(frame_data["gpa"])
    if "satScore" in frame_data:
        profile_updates["sat_score"] = int(frame_data["satScore"])
    if "actScore" in frame_data:
        profile_updates["act_score"] = int(frame_data["actScore"])
    if "classRank" in frame_data:
        profile_updates["class_rank"] = int(frame_data["classRank"])
    if "classSize" in frame_data:
        profile_updates["class_size"] = int(frame_data["classSize"])

    # Target schools (JSONB)
    if "targetSchools" in frame_data:
        profile_updates["target_schools"] = frame_data["targetSchools"]

    # Target majors (array)
    if "targetMajors" in frame_data:
        profile_updates["target_majors"] = frame_data["targetMajors"]

    # Interests (JSONB array)
    if "interests" in frame_data:
        profile_updates["interests"] = frame_data["interests"]

    # Values (JSONB array)
    if "values" in frame_data:
        profile_updates["values"] = frame_data["values"]

    # Activities (JSONB array)
    if "activities" in frame_data:
        profile_updates["activities"] = frame_data["activities"]

    # Awards (JSONB array)
    if "awards" in frame_data:
        profile_updates["awards"] = frame_data["awards"]

    # Programs (JSONB array)
    if "programs" in frame_data:
        profile_updates["programs"] = frame_data["programs"]

    # Goals (JSONB)
    if "goals" in frame_data:
        profile_updates["goals"] = frame_data["goals"]

    # Identity synthesis (JSONB) - computed after assessment
    if "identitySynthesis" in frame_data:
        profile_updates["identity_synthesis"] = frame_data["identitySynthesis"]

    # Four pillars (JSONB) - computed after assessment
    if "fourPillars" in frame_data:
        profile_updates["four_pillars"] = frame_data["fourPillars"]

    # Computed scores
    if "ivyScore" in frame_data:
        profile_updates["ivy_score"] = float(frame_data["ivyScore"])

    # Mark assessment complete if all frames done
    if frame_data.get("assessmentComplete"):
        profile_updates["assessment_completed_at"] = datetime.utcnow().isoformat()
        profile_updates["onboarding_completed"] = True

    # Upsert profile
    result = supabase.table("profiles").upsert({
        "user_id": user_id,
        **profile_updates
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to save assessment data")

    return {"success": True, "profile": result.data[0]}


@router.post("/{user_id}/agent-output/{agent_name}")
async def save_agent_output(user_id: str, agent_name: str, output: dict):
    """
    Save agent output to profile's agent_outputs namespace.
    Each agent has isolated workspace.
    """
    supabase = get_supabase_client()

    # Get current profile
    profile_result = supabase.table("profiles").select("agent_outputs").eq("user_id", user_id).single().execute()

    if not profile_result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update agent workspace
    agent_outputs = profile_result.data.get("agent_outputs") or {}
    agent_outputs[agent_name] = {
        "last_run": datetime.utcnow().isoformat(),
        "output": output.get("output"),
        "quality_score": output.get("quality_score"),
        "error": output.get("error"),
    }

    # Save back
    result = supabase.table("profiles").update({
        "agent_outputs": agent_outputs
    }).eq("user_id", user_id).execute()

    return {"success": True}
```

---

## 9. Frontend Service Updates

### 9.1 Update `/frontend/src/lib/services/profileService.ts`

```typescript
import { supabase } from '@/lib/supabase/client';
import type { Profile, ProfileUpdate, TargetSchools, IdentitySynthesis } from '@/lib/types/profile';

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}

/**
 * Create or update profile (upsert)
 */
export async function upsertProfile(
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data as Profile;
}

/**
 * Update specific profile fields
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as Profile;
}

/**
 * Save assessment frame data to profile
 * Maps camelCase frame fields to snake_case DB columns
 */
export async function saveAssessmentToProfile(
  userId: string,
  frameData: Record<string, unknown>
): Promise<boolean> {
  // Map camelCase to snake_case and extract values
  const profileUpdates: Partial<Profile> = {};

  // Basic info
  if (frameData.firstName) profileUpdates.first_name = frameData.firstName as string;
  if (frameData.lastName) profileUpdates.last_name = frameData.lastName as string;
  if (frameData.grade) profileUpdates.grade = Number(frameData.grade);
  if (frameData.graduationYear) profileUpdates.graduation_year = Number(frameData.graduationYear);

  // School info
  if (frameData.schoolName) profileUpdates.school_name = frameData.schoolName as string;
  if (frameData.schoolType) profileUpdates.school_type = frameData.schoolType as Profile['school_type'];
  if (frameData.state) profileUpdates.location_state = frameData.state as string;

  // Academic
  if (frameData.gpa) profileUpdates.gpa = Number(frameData.gpa);
  if (frameData.satScore) profileUpdates.sat_score = Number(frameData.satScore);
  if (frameData.actScore) profileUpdates.act_score = Number(frameData.actScore);
  if (frameData.classRank) profileUpdates.class_rank = Number(frameData.classRank);
  if (frameData.classSize) profileUpdates.class_size = Number(frameData.classSize);

  // Target schools (JSONB)
  if (frameData.targetSchools) {
    profileUpdates.target_schools = frameData.targetSchools as TargetSchools;
  }

  // Target majors (array)
  if (frameData.targetMajors) {
    profileUpdates.target_majors = frameData.targetMajors as string[];
  }

  // JSONB array fields
  if (frameData.interests) profileUpdates.interests = frameData.interests as Profile['interests'];
  if (frameData.values) profileUpdates.values = frameData.values as Profile['values'];
  if (frameData.activities) profileUpdates.activities = frameData.activities as Profile['activities'];
  if (frameData.awards) profileUpdates.awards = frameData.awards as Profile['awards'];
  if (frameData.programs) profileUpdates.programs = frameData.programs as Profile['programs'];
  if (frameData.goals) profileUpdates.goals = frameData.goals as Profile['goals'];
  if (frameData.strengths) profileUpdates.strengths = frameData.strengths as string[];
  if (frameData.challenges) profileUpdates.challenges = frameData.challenges as string[];

  // Identity synthesis (computed after assessment)
  if (frameData.identitySynthesis) {
    profileUpdates.identity_synthesis = frameData.identitySynthesis as IdentitySynthesis;
  }

  // Four pillars (computed after assessment)
  if (frameData.fourPillars) {
    profileUpdates.four_pillars = frameData.fourPillars as Profile['four_pillars'];
  }

  // Computed scores
  if (frameData.ivyScore) profileUpdates.ivy_score = Number(frameData.ivyScore);
  if (frameData.narrativeScore) profileUpdates.narrative_score = Number(frameData.narrativeScore);

  // Mark assessment complete
  if (frameData.assessmentComplete) {
    profileUpdates.assessment_completed_at = new Date().toISOString();
    profileUpdates.onboarding_completed = true;
  }

  // Upsert to database
  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...profileUpdates,
    });

  if (error) {
    console.error('Error saving assessment to profile:', error);
    return false;
  }

  return true;
}

/**
 * Save agent output to profile's agent_outputs namespace
 */
export async function saveAgentOutput(
  userId: string,
  agentName: string,
  output: Record<string, unknown>,
  qualityScore?: number
): Promise<boolean> {
  // Get current agent_outputs
  const { data: profile } = await supabase
    .from('profiles')
    .select('agent_outputs')
    .eq('user_id', userId)
    .single();

  const agentOutputs = (profile?.agent_outputs || {}) as Record<string, unknown>;

  // Update specific agent namespace
  agentOutputs[agentName] = {
    last_run: new Date().toISOString(),
    output,
    quality_score: qualityScore,
  };

  // Save back
  const { error } = await supabase
    .from('profiles')
    .update({ agent_outputs: agentOutputs })
    .eq('user_id', userId);

  if (error) {
    console.error('Error saving agent output:', error);
    return false;
  }

  return true;
}
```

---

## 10. Agent Integration

### 10.1 Update Agent Profile Loading

In each agent file, update how profiles are loaded to use the new schema:

```python
# In backend/agents/specialists/*.py

def transform_profile_for_agent(db_profile: dict) -> dict:
    """
    Transform database profile to agent-friendly format.
    Handles JSONB fields and provides defaults.
    """
    return {
        "id": db_profile.get("id"),
        "user_id": db_profile.get("user_id"),
        "first_name": db_profile.get("first_name"),
        "last_name": db_profile.get("last_name"),
        "grade": db_profile.get("grade") or 11,
        "graduation_year": db_profile.get("graduation_year"),

        # Academic
        "gpa": db_profile.get("gpa"),
        "sat_score": db_profile.get("sat_score"),
        "act_score": db_profile.get("act_score"),

        # Targets
        "target_schools": db_profile.get("target_schools") or {"dream": [], "reach": [], "target": [], "safety": []},
        "target_majors": db_profile.get("target_majors") or [],

        # Identity synthesis - CRITICAL for agents
        "identity_synthesis": db_profile.get("identity_synthesis") or {},
        "archetype": (db_profile.get("identity_synthesis") or {}).get("archetype", {}),
        "spike": (db_profile.get("identity_synthesis") or {}).get("spike", ""),
        "pillars": (db_profile.get("identity_synthesis") or {}).get("pillars", {}),

        # Portfolio (may be empty for underclassmen - that's OK!)
        "activities": db_profile.get("activities") or [],
        "awards": db_profile.get("awards") or [],
        "programs": db_profile.get("programs") or [],

        # Assessment primitives
        "interests": db_profile.get("interests") or [],
        "values": db_profile.get("values") or [],
        "goals": db_profile.get("goals") or {},
        "strengths": db_profile.get("strengths") or [],
        "challenges": db_profile.get("challenges") or [],

        # Four pillars
        "four_pillars": db_profile.get("four_pillars") or {},
    }
```

### 10.2 Archetype ID Mapping

Ensure all agents use the archetype mapping (already added but documenting here):

```python
# Standard archetype mapping for all agents
ARCHETYPE_MAP = {
    # Legacy IDs → Enriched data keys
    "scholar": "academic_powerhouse",
    "researcher": "stem_innovator",
    "entrepreneur": "entrepreneurial_leader",
    "leader": "entrepreneurial_leader",
    "changemaker": "community_changemaker",
    "creator": "creative_visionary",

    # Direct passthrough for new IDs
    "academic_powerhouse": "academic_powerhouse",
    "stem_innovator": "stem_innovator",
    "entrepreneurial_leader": "entrepreneurial_leader",
    "community_changemaker": "community_changemaker",
    "creative_visionary": "creative_visionary",
    "humanities_scholar": "humanities_scholar",
    "athletic_scholar": "athletic_scholar",
    "multi_hyphenate": "multi_hyphenate",
}

# Usage in agent:
archetype_id = ARCHETYPE_MAP.get(raw_archetype_id.lower(), raw_archetype_id)
```

---

## 11. Implementation Checklist

### Phase 1: Database (Day 1)

- [ ] **1.1** Run SQL script in Supabase SQL Editor (drops existing profiles table)
- [ ] **1.2** Verify table created with all columns
- [ ] **1.3** Verify indexes created
- [ ] **1.4** Verify RLS policies active
- [ ] **1.5** Test `upsert_profile` function with sample data

### Phase 2: Backend Types (Day 1)

- [ ] **2.1** Create `/backend/agents/schemas/profile_v2.py`
- [ ] **2.2** Update schema `__init__.py` to export new models
- [ ] **2.3** Test Pydantic models with sample data

### Phase 3: Frontend Types (Day 1)

- [ ] **3.1** Create `/frontend/src/lib/types/profile.ts`
- [ ] **3.2** Update any imports in existing code

### Phase 4: API Routes (Day 2)

- [ ] **4.1** Update `/backend/api/routes/profiles.py`
- [ ] **4.2** Add `/save-assessment` endpoint
- [ ] **4.3** Add `/agent-output/{agent_name}` endpoint
- [ ] **4.4** Test all endpoints with Postman/curl

### Phase 5: Frontend Services (Day 2)

- [ ] **5.1** Update `profileService.ts` with new functions
- [ ] **5.2** Update `saveAssessmentToProfile()` mapping
- [ ] **5.3** Test assessment save flow end-to-end

### Phase 6: Assessment Flow Integration (Day 3)

- [ ] **6.1** Update assessment frame completion handler
- [ ] **6.2** Call `saveAssessmentToProfile()` at each frame
- [ ] **6.3** Trigger identity synthesis computation after Frame 12
- [ ] **6.4** Save computed scores to profile

### Phase 7: Agent Updates (Day 3-4)

- [ ] **7.1** Add `transform_profile_for_agent()` utility
- [ ] **7.2** Update each agent to use transformed profile
- [ ] **7.3** Verify ARCHETYPE_MAP in all agents
- [ ] **7.4** Test agents with new profile structure

### Phase 8: Testing (Day 4)

- [ ] **8.1** Create test user and run through full assessment
- [ ] **8.2** Verify all fields persist to database
- [ ] **8.3** Verify agents receive complete profile data
- [ ] **8.4** Verify underclassmen (empty portfolio) works correctly
- [ ] **8.5** Verify dashboard displays correct data

---

## Quick Reference Card

### Database Schema Summary

```
profiles (
  -- Required
  id UUID PK
  user_id UUID FK → auth.users
  first_name TEXT
  created_at TIMESTAMPTZ

  -- Optional flat columns
  last_name, grade, graduation_year, gpa, sat_score, act_score...

  -- JSONB columns
  target_schools    → {dream:[], reach:[], target:[], safety:[]}
  identity_synthesis → {archetype:{}, spike:"", pillars:{}, brand_statement:""}
  activities        → [{name, description, role_level, ...}]
  awards            → [{name, organization, level, ...}]
  programs          → [{name, organization, type, ...}]
  interests         → [{area, level}]
  values            → [{value, importance}]
  goals             → {short_term:[], medium_term:[], long_term:[]}
  four_pillars      → {identity:{}, aptitude:{}, passion:{}, service:{}}
  agent_outputs     → {ec:{...}, awards:{...}, programs:{...}}
)
```

### Key Principles Reminder

1. **Only 4 required fields**: id, user_id, first_name, created_at
2. **Empty portfolio is valid**: Underclassmen have no activities yet
3. **JSONB for complex data**: Flexible, evolves without migrations
4. **Agent namespaces**: Each agent writes to its own `agent_outputs.{name}`
5. **Source tracking**: Every computed field tracks origin
6. **Archetype mapping**: Legacy IDs → Enriched data keys

---

## Support

If you encounter issues:

1. Check Supabase logs for SQL errors
2. Verify RLS policies allow operations
3. Check agent logs for profile transformation errors
4. Ensure ARCHETYPE_MAP includes all expected archetypes

---

**END OF HANDOVER DOCUMENT**
