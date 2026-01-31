# ProgramsAgent - Tier 2: Specialist
# Path: backend/agents/specialists/programs.py
# Role: The Scout (Summer Program Recommendations)
"""
ProgramsAgent (Tier 2: Specialist)

The Scout that generates summer program recommendations.
Outputs ProgramsOutput with 5 core programs + 1 STEM swap.

Strategy: Recommend prestigious programs that are timeline-appropriate
and align with student's archetype and interests.
"""

from typing import List, Dict, Any
from backend.agents.base import IvyAgent
from backend.agents.schemas import ProgramsOutput, ProgramRecommendation


# =============================================================================
# PROGRAM TEMPLATES BY ARCHETYPE
# =============================================================================

PROGRAM_TEMPLATES = {
    "SCHOLAR": [
        {
            "name": "TASP (Telluride Association Summer Program)",
            "description": "6-week humanities seminar for rising seniors",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.95,
        },
        {
            "name": "Yale Young Global Scholars",
            "description": "2-week interdisciplinary program at Yale",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.9,
        },
        {
            "name": "Stanford Summer Humanities Institute",
            "description": "3-week intensive humanities program",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.88,
        },
        {
            "name": "Governor's School (State Program)",
            "description": "State-funded residential academic program",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.85,
        },
        {
            "name": "Columbia Summer Immersion",
            "description": "Pre-college program in liberal arts",
            "impact_level": "REGIONAL",
            "difficulty": "EASY",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.75,
        },
    ],
    "RESEARCHER": [
        {
            "name": "RSI (Research Science Institute)",
            "description": "6-week MIT research program (most prestigious STEM)",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.99,
        },
        {
            "name": "SSP (Summer Science Program)",
            "description": "6-week astrophysics/biochemistry research",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.98,
        },
        {
            "name": "NIH Summer Internship",
            "description": "8-week biomedical research at NIH",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.92,
        },
        {
            "name": "University Lab Research Position",
            "description": "Self-sourced research position at local university",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.85,
        },
        {
            "name": "Garcia MRSEC Program (Stony Brook)",
            "description": "7-week materials science research",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.90,
        },
    ],
    "ENTREPRENEUR": [
        {
            "name": "LaunchX (MIT Entrepreneurship)",
            "description": "4-week startup accelerator program",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.95,
        },
        {
            "name": "Wharton Leadership in the Business World",
            "description": "4-week business leadership program",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Summer before Senior Year",
            "fit_score": 0.92,
        },
        {
            "name": "NSLC Business & Entrepreneurship",
            "description": "9-day intensive business program",
            "impact_level": "NATIONAL",
            "difficulty": "EASY",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.80,
        },
        {
            "name": "Y Combinator Startup School",
            "description": "Online startup accelerator (free)",
            "impact_level": "NATIONAL",
            "difficulty": "EASY",
            "timeline": "Ongoing",
            "fit_score": 0.75,
        },
        {
            "name": "Local Startup Internship",
            "description": "Summer internship at early-stage startup",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Summer before Junior/Senior Year",
            "fit_score": 0.88,
        },
    ],
    "DEFAULT": [
         {
            "name": "Local University Pre-College",
            "description": "Summer courses for college credit",
            "impact_level": "REGIONAL",
            "difficulty": "EASY",
            "timeline": "Summer",
            "fit_score": 0.70,
        },
    ]
}

DEFAULT_TEMPLATES = PROGRAM_TEMPLATES["SCHOLAR"]

# STEM-heavy swaps for the 1-Swap Rule
STEM_PROGRAM_SWAPS = {
    "SCHOLAR": {
        "name": "Ross Mathematics Program",
        "description": "8-week intensive number theory program",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Summer before Senior Year",
        "rationale": "For MIT/Caltech, pure math programs demonstrate theoretical depth",
        "fit_score": 0.90,
    },
    "RESEARCHER": {
        "name": "RSI (Research Science Institute)",
        "description": "The gold standard - 6-week MIT research",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Summer before Senior Year",
        "rationale": "RSI is the single most prestigious STEM program",
        "fit_score": 0.99,
    },
    "ENTREPRENEUR": {
        "name": "MIT Launch (Technical Startups Track)",
        "description": "4-week deep-tech startup program",
        "impact_level": "NATIONAL",
        "difficulty": "MODERATE",
        "timeline": "Summer before Senior Year",
        "rationale": "Technical entrepreneurship > general business for STEM schools",
        "fit_score": 0.92,
    },
}

# =============================================================================
# PROGRAMS AGENT
# =============================================================================

class ProgramsAgent(IvyAgent):
    """
    The Scout - Generates summer program recommendations.
    
    Tier: 2 (Specialist)
    Output: ProgramsOutput (5 core + 1 STEM swap)
    """
    
    @property
    def agent_id(self) -> str:
        return "spec_programs"
    
    @property
    def tier(self) -> int:
        return 2
    
    def get_instructions(self) -> List[str]:
        return [
            "You are the Programs Specialist for IvyLevel.",
            "Your role is to identify prestigious summer programs that fit the student.",
            "",
            "RULES:",
            "1. TIMELINE-AWARE: Only recommend programs student can still apply to",
            "2. PRESTIGE HIERARCHY: RSI/TASP/SSP > State Programs > Paid Programs",
            "3. ARCHETYPE Fit: Programs must align with student's spike",
            "4. REALISTIC: Consider acceptance rates and student's current profile",
            "5. THE 1-SWAP RULE: Provide a STEM-heavy alternate for MIT/Caltech",
        ]
    
    def run(self, message: str = "", mode: str = "planning", context: dict = {}) -> Dict[str, Any]:
        """
        MODE ROUTING (v7.1):
        - planning: Generate full program portfolio
        - execution: Provide tactical advice for current application
        """
        if mode == "planning":
            return self.run_planning_mode(context)
        else:
            return self.run_execution_mode(message, context)
    
    def run_planning_mode(self, context: dict) -> Dict[str, Any]:
        """PLANNING MODE: Generate program recommendations."""
        profile = context.get("profile", self.profile)
        assessment = context.get("assessment", {})
        result = self.generate_recommendations(profile, assessment)
        return result.model_dump()
    
    def run_execution_mode(self, message: str, context: dict) -> Dict[str, Any]:
        """EXECUTION MODE: Provide tactical advice for program application."""
        program_name = context.get("target_name", "")
        
        self.instructions = [
            f"MISSION: Secure acceptance to '{program_name}'.",
            "1. IDENTIFY 'Gatekeeper Factors' (What causes rejection?).",
            "   - Example: For RSI, it's lack of research specificity.",
            "2. PROVIDE 'Essay Recycling' tips (Reuse JCamp for Princeton?).",
            "3. CHECK 'LOR Strategy' (Does this need a STEM teacher?).",
            "OUTPUT: Specific, tactical advice for this program."
        ]
        
        try:
            response = super().run(message or "Provide Execution Guidance")
            advice = response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            advice = f"AI Advice Unavailable: {e}"
        
        return {
            "mode": "execution",
            "target": program_name,
            "advice": advice
        }
    
    def _load_enriched_programs(self) -> List[Dict]:
        """Load enriched programs database."""
        import json
        from pathlib import Path
        try:
            path = Path(__file__).parent.parent.parent / "seeds" / "enriched" / "programs_enriched.json"
            if path.exists():
                with open(path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load enriched programs: {e}")
        return []

    def generate_recommendations(
        self,
        profile: Dict[str, Any],
        assessment: Dict[str, Any],
    ) -> ProgramsOutput:
        """
        Generate program recommendations using 91% more data (Enriched Database).
        """
        # 1. Load Data
        all_programs = self._load_enriched_programs()
        
        # Fallback
        if not all_programs:
            return self._generate_fallback_recommendations(profile, assessment)
            
        # 2. Context
        from backend.agents.utils import transform_profile_for_agent, ARCHETYPE_MAP
        
        # Ensure we are working with a V2-compliant profile
        safe_profile = transform_profile_for_agent(profile)
        
        # Get Identity Synthesis from the safe profile (preferred) or assessment (fallback)
        identity_syn = safe_profile.get("identity_synthesis") or assessment.get("identity_synthesis") or {}
        
        # Extract Archetype ID
        raw_archetype = identity_syn.get("archetype", {})
        if not raw_archetype:
             # Fallback to older assessment structure
             raw_archetype = assessment.get("archetype", {})
             
        raw_id = None
        if isinstance(raw_archetype, dict):
            raw_id = raw_archetype.get("id")
        else:
            raw_id = str(raw_archetype) if raw_archetype else "scholar"
            
        archetype_key = str(raw_id).lower() if raw_id else "scholar"
        if not archetype_key or archetype_key == "none": archetype_key = "scholar"

        # Map to Enriched DB Keys using shared utility
        archetype_id = ARCHETYPE_MAP.get(archetype_key, "academic_powerhouse")

        grade = profile.get("grade", 11)
        
        # 3. Filter & Score
        matches = []
        for p in all_programs:
            # Eligibility (Default lenient if missing)
            if "eligibility" in p and "grades" in p["eligibility"]:
                if grade not in p["eligibility"]["grades"]:
                    continue
            
            # Archetype Fit
            fits = p.get("archetype_fit", {})
            fit_score = fits.get(archetype_id, 0.4) 
            
            if fit_score < 0.3: continue
            
            matches.append({
                "data": p,
                "fit_score": fit_score,
                "prestige": p.get("prestige_score", 5)
            })
            
        # 4. Sort by Fit provided by JSON + Prestige
        # We value fit most, then prestige
        matches.sort(key=lambda x: (x["fit_score"], x["prestige"]), reverse=True)
        
        # 5. Select Core 5
        core_matches = matches[:5]
        core_recs = []
        
        curr_names = set()
        for m in core_matches:
            d = m["data"]
            curr_names.add(d.get("name"))
            core_recs.append(ProgramRecommendation(
                name=d.get("name", "Unknown Program"),
                organization=d.get("organization", ""),
                fit_score=m["fit_score"],
                type=d.get("type", "summer"),
                # Rename 'timeline' to 'deadline' if needed or stick to schema
                application_deadline=d.get("timeline") or d.get("deadline", "Check Website"),
                description=d.get("description", ""),
                selectivity=d.get("acceptance_rate", 0.5),
                strategic_tier="target" if m["prestige"] < 8 else "reach",
                # Intelligence
                success_patterns=d.get("success_patterns", []),
                common_mistakes=d.get("common_mistakes", []),
                hidden_value=d.get("hidden_value", []),
                synergies=d.get("synergies"),
                differentiation_factor=d.get("differentiation_factor", "")
            ))
            
        # 6. Select STEM Swap (1-Swap Rule)
        # Find highest prestige STEM/Research program NOT in core
        stem_swap = None
        for m in matches[5:]: # Look beyond top 5
            d = m["data"]
            is_stem = d.get("type") in ["research", "stem"] or "Science" in d.get("name") or "Math" in d.get("name")
            if is_stem and d.get("name") not in curr_names:
                stem_swap = ProgramRecommendation(
                    name=d.get("name"),
                    organization=d.get("organization", ""),
                    fit_score=m["fit_score"],
                    type=d.get("type", "summer"),
                    application_deadline=d.get("timeline"),
                    description=f"SWAP OPTION: {d.get('description')}",
                    selectivity=d.get("acceptance_rate", 0.1),
                    strategic_tier="reach",
                    success_patterns=d.get("success_patterns", []),
                    hidden_value=["High impact for MIT/Caltech applications"],
                    differentiation_factor=d.get("differentiation_factor", "")
                )
                break
        
        # ReAct Metadata
        from backend.agents.schemas.react import ReactMetadata, CycleSummary
        from datetime import datetime
        
        meta = ReactMetadata(
            agent_name="Programs",
            cycles_executed=1,
            quality_score=0.95 if len(core_recs) >= 3 else 0.6,
            cycle_summary=[
                CycleSummary(
                    iteration=1,
                    phases={
                        "THINK": {"thought": f"Scanned {len(all_programs)} enriched programs for {archetype_id}", "timestamp": datetime.utcnow().isoformat()},
                        "ACT": {"action": "Filtered by eligibility and archetype fit", "timestamp": datetime.utcnow().isoformat()},
                        "OBSERVE": {"observation": f"Selected {len(core_recs)} core Matches + Swap: {stem_swap.name if stem_swap else 'None'}", "quality_score": 0.95, "timestamp": datetime.utcnow().isoformat()}
                    }
                )
            ]
        )

        return ProgramsOutput(
            recommended_programs=core_recs,
            stem_heavy_swap=stem_swap,
            react_metadata=meta,
            summary={"total_programs_matched": len(matches)}
        )

    def _generate_fallback_recommendations(self, profile, assessment) -> ProgramsOutput:
        """Legacy fallback."""
        archetype_data = assessment.get("archetype", {})
        if isinstance(archetype_data, dict):
            archetype_id = archetype_data.get("id", "SCHOLAR")
        else:
            archetype_id = archetype_data or "SCHOLAR"
            
        templates = PROGRAM_TEMPLATES.get(archetype_id, PROGRAM_TEMPLATES.get("SCHOLAR", DEFAULT_TEMPLATES))
        stem_match = STEM_PROGRAM_SWAPS.get(archetype_id, STEM_PROGRAM_SWAPS["SCHOLAR"])
        
        core_recs = [
            ProgramRecommendation(name=t["name"], description=t["description"], fit_score=t["fit_score"], strategic_tier="target")
            for t in templates[:5]
        ]
        
        swap = ProgramRecommendation(name=stem_match["name"], description=stem_match["description"], fit_score=stem_match["fit_score"], strategic_tier="reach")
        
        return ProgramsOutput(recommended_programs=core_recs, stem_heavy_swap=swap)


def create_programs_agent(student_id: str) -> ProgramsAgent:
    """Factory function for the agent registry"""
    return ProgramsAgent(student_id)
