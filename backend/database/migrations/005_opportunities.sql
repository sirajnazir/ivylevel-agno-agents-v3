-- Migration: Create opportunities table (v9.2 Legacy Port)
-- Combines Awards and Programs into a single catalog table

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,            -- 'Award', 'Program', 'Competition'
    category TEXT,                 -- 'STEM', 'Humanities', 'General', etc.
    description TEXT,
    
    -- Logistics
    deadline TEXT,                 -- Stored as text (e.g., "October 15" or ISO date)
    cost TEXT,                     -- "Free", "$100", etc.
    eligibility_grade TEXT,        -- "9-12", "11 only"
    
    -- Metadata (Enriched)
    prestige_score INTEGER,        -- 1-10 (proxy for Tier)
    difficulty_level TEXT,         -- "High", "Medium", "Low"
    url TEXT,
    
    -- Search Vector (Optional for future)
    search_vector tsvector,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category search
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
