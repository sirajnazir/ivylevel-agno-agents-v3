# MIRRORS: lib/constants/defaults.ts
# THE MIRROR LAW: Do not modify these values
"""
Centralized Default Values for IvyLevel Scoring System.

PRINCIPLE: All default values are defined here as the SINGLE SOURCE OF TRUTH.
These defaults represent reasonable baseline assumptions for incomplete profiles.

Defaults are based on:
- Median applicant data from Chetty 2023
- College Board percentile distributions
- IvyLevel spec recommendations
"""

from typing import Dict, Any

# =============================================================================
# NORMALIZED SCORE DEFAULTS (0.0 - 1.0 scale)
# =============================================================================

NORMALIZED_DEFAULTS: Dict[str, Dict[str, float]] = {
    # Aptitude category defaults
    "aptitude": {
        "gpa": 0.5,           # 3.3 GPA equivalent (median)
        "sat": 0.5,           # ~1300 SAT equivalent
        "rigor": 0.4,         # 4-5 AP courses
        "awards": 0.0,        # No awards (conservative)
    },

    # Passion category defaults
    "passion": {
        "leadership": 0.25,   # Participant level
        "project": 0.2,       # Small group impact (~20 people)
        "research": 0.0,      # No research
        "commitment": 0.5,    # 2 years, moderate hours
        "awards": 0.0,        # No EC awards
    },

    # Community category defaults
    "community": {
        "service": 0.3,       # Participant level volunteer
        "hours": 0.4,         # ~75 hours
        "impact": 0.2,        # Small local impact
    },

    # Narrative/Psychometric defaults
    "narrative": {
        "vision_clarity": 0.5,
        "identity_comfort": 0.5,
        "articulation": 0.5,
        "maturity": 0.5,
        "grit": 0.5,
        "coachability": 0.5,
        "description_quality": 0.5,
    },
}

# =============================================================================
# RAW VALUE DEFAULTS (before normalization)
# =============================================================================

RAW_DEFAULTS: Dict[str, Dict[str, Any]] = {
    "aptitude": {
        "gpa_weighted": 3.5,
        "gpa_unweighted": 3.3,
        "sat_total": 1300,
        "act_total": 28,
        "ap_count": 5,
        "ap_avg_score": 3.5,
    },

    "passion": {
        "ec_commitment_years": 2,
        "ec_hours_weekly": 8,
        "project_impact": 20,
    },

    "community": {
        "service_hours": 75,
        "community_impact": 20,
    },
}

# =============================================================================
# CATEGORY WEIGHTS (from IvyLevel spec)
# =============================================================================

CATEGORY_WEIGHTS: Dict[str, Dict[str, float]] = {
    "aptitude": {
        "gpa": 0.35,
        "sat": 0.30,
        "rigor": 0.20,
        "awards": 0.15,
    },

    "passion": {
        "leadership": 0.35,
        "project": 0.20,
        "research": 0.20,
        "commitment": 0.15,
        "awards": 0.10,
    },

    "community": {
        "service": 0.35,
        "impact": 0.35,
        "hours": 0.20,
        "description": 0.10,
    },

    "narrative": {
        "vision": 0.30,
        "identity": 0.25,
        "articulation": 0.25,
        "maturity": 0.20,
    },

    # Overall Ivy+ Ready Score weights
    "overall": {
        "aptitude": 0.30,
        "passion": 0.35,
        "community": 0.25,
        "narrative": 0.10,
    },
}

# =============================================================================
# SCHOOL THRESHOLDS (C_j for sigmoid)
# Calibrated to CDS 2025 base rates
# =============================================================================

SCHOOL_THRESHOLDS: Dict[str, float] = {
    "HARVARD": 3.1,      # 4.2% acceptance
    "STANFORD": 3.2,     # 3.9% acceptance
    "YALE": 2.95,        # 5.1% acceptance
    "MIT": 2.8,          # 5.7% acceptance
    "PRINCETON": 2.75,   # 5.8% acceptance
    "CALTECH": 2.6,      # 6.4% acceptance
    "CMU": 2.2,          # 11% acceptance
    "COLUMBIA": 2.9,     # ~5% acceptance
    "UPENN": 2.7,        # ~6% acceptance
    "BROWN": 2.85,       # ~5.5% acceptance
    "DARTMOUTH": 2.75,   # ~6% acceptance
    "CORNELL": 2.5,      # ~8% acceptance
    "DUKE": 2.6,         # ~6% acceptance
    "NORTHWESTERN": 2.5, # ~7% acceptance
    "UCHICAGO": 2.7,     # ~6% acceptance
}

# =============================================================================
# DEMOGRAPHIC/CONTEXT DEFAULTS
# =============================================================================

CONTEXT_DEFAULTS: Dict[str, Dict[str, Any]] = {
    "demographics": {
        "ethnicity_multiplier": 1.0,
        "first_gen_multiplier": 1.15,  # Chetty 2023
        "income_multiplier": 1.20,     # Top 1% network effect
        "athlete_multiplier": 2.5,     # Recruited athletes
    },

    "high_school": {
        "saturation_adjustment": 0.0,
        "saturation_level": "MEDIUM",
    },
}

# =============================================================================
# VALIDATION BOUNDS
# =============================================================================

VALIDATION_BOUNDS: Dict[str, Dict[str, float]] = {
    "normalized": {
        "min": 0.0,
        "max": 1.0,
    },

    "percentage_score": {
        "min": 0.0,
        "max": 100.0,
    },

    "probability": {
        "min": 0.0,
        "max": 0.95,  # Capped at 95% per spec
    },

    "rubric_rating": {
        "min": 1.0,
        "max": 6.0,  # SFFA rubric scale
    },

    "gpa": {
        "min": 0.0,
        "max": 5.0,  # Weighted GPA can exceed 4.0
    },

    "sat": {
        "min": 400.0,
        "max": 1600.0,
    },

    "act": {
        "min": 1.0,
        "max": 36.0,
    },
}

# =============================================================================
# FACTOR THRESHOLDS (For helping/holding back analysis)
# =============================================================================

FACTOR_THRESHOLDS: Dict[str, Dict[str, float]] = {
    # Strong = above these values
    "strong": {
        "gpa_normalized": 0.65,      # Top 35% = "strong"
        "sat_normalized": 0.65,
        "rigor_normalized": 0.60,
        "leadership_normalized": 0.50,
        "project_normalized": 0.40,
        "research_normalized": 0.50,
        "commitment_normalized": 0.60,
        "service_normalized": 0.50,
        "hours_normalized": 0.50,
        "grit": 0.60,
        "category_score": 50.0,      # Above 50% = above average
    },
    # Weak = below these values
    "weak": {
        "gpa_normalized": 0.40,      # Bottom 40% = needs work
        "sat_normalized": 0.40,
        "rigor_normalized": 0.35,
        "awards_normalized": 0.10,   # No awards
        "project_normalized": 0.30,
        "service_normalized": 0.25,
        "category_score": 60.0,      # Below 60% = needs improvement
    },
}

# =============================================================================
# DEFAULT TARGET SCHOOLS
# =============================================================================

DEFAULT_TARGET_SCHOOLS = [
    "HARVARD",
    "STANFORD",
    "MIT",
    "YALE",
    "PRINCETON",
    "CALTECH",
    "CMU",
    "COLUMBIA",
]
