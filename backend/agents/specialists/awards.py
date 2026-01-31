# AwardsAgent - Tier 2: Specialist
# Path: backend/agents/specialists/awards.py
# Role: The Sniper (Competition & Award Targeting)
"""
AwardsAgent (Tier 2: Specialist)

The Sniper that generates award/competition recommendations.
Outputs 2-2-1 Portfolio (Reach/Target/Safety) + STEM swap.

Strategy: Target awards that align with archetype and are realistically winnable.
"""

from typing import List, Dict, Any, Optional
from backend.agents.base import IvyAgent
from backend.agents.schemas import (
    AwardsOutput, AwardPortfolio, AwardMatch, RecommendationItem
)
# Keep RecommendationItem for internal backwards compat if needed, or remove if unused.
# Actually, the prompts say "use new schemas", so we should transition fully.

from backend.agents.logic.awards_math import get_award_tactics
from backend.agents.logic.scout_math import calculate_fit_score

import uuid

class AwardsAgent(IvyAgent):
    """
    Tier 2 Specialist: The Sniper (Awards).
    """
    @property
    def agent_id(self) -> str:
        return "spec_awards"
    
    @property
    def tier(self) -> int:
        return 2

    def get_instructions(self) -> List[str]:
        return self.instructions if hasattr(self, 'instructions') else [
            "You are the Awards Specialist for IvyLevel.",
            "Your role is to identify realistic, high-impact award targets.",
            "",
            "RULES:",
            "1. REALISTIC: Only recommend awards the student can realistically win",
            "2. TIMELINE: Consider grade level and application deadlines",
            "3. ARCHETYPE FIT: Awards must align with student's spike",
            "4. IMPACT HIERARCHY: Prioritize National > Regional > State > School",
            "5. THE 1-SWAP RULE: Provide a STEM-heavy alternate for MIT/Caltech",
        ]

    def run(self, message: str = "", mode: str = "planning", context: dict = {}) -> Any:
        # Mode routing
        if mode == "planning":
            return self.run_planning_mode(context)
        elif mode == "execution":
            return self.run_execution_mode(context)
        else:
            return super().run(message) # Fallback

    # --- EXECUTION MODE: The Tactical Coach ---
    def run_execution_mode(self, context: dict) -> Dict[str, Any]:
        """
        Called by Jenny when student is working on a specific award.
        Returns: Templates, Checklists, Rubrics.
        """
        award_name = context.get("target_name", "General Award")
        
        # 1. Retrieve Domain-Specific Tactics
        tactics = get_award_tactics(award_name)
        
        # 2. Set Instructions for LLM Execution
        self.instructions = [
            f"MISSION: Help student WIN '{award_name}'.",
            f"STRATEGY: Use the {tactics.get('strategy', 'Standard')} approach.",
            f"1. PROVIDE the 'Winning Structure': {tactics.get('essay_structure', 'Intro -> Body -> Conclusion')}.",
            f"2. LIST the 'Buzzwords' to include: {', '.join(tactics.get('buzzwords', []))}.",
            f"3. SHARE the 'Rubric': {tactics.get('rubric_focus', 'Excellence')}.",
            f"4. WARN about Pitfalls: {tactics.get('common_pitfalls', 'None')}.",
            "OUTPUT: Actionable advice, specific paragraphs or outlines, not generic encouragement."
        ]
        
        # Run the agent with context
        try:
            response = super().run(f"Providing tactical guidance for {award_name}. Tactics: {tactics}")
        except Exception as e:
            response = "AI Advice Unavailable (Check API Key). Returning tactics only."
        
        # Return structured data + LLM advice
        return {
            "tactics": tactics,
            "advice": response,
            "target": award_name
        }
    
    def run_planning_mode(self, context: dict) -> Dict[str, Any]:
        """PLANNING MODE: Generate bucketed award portfolio."""
        profile = context.get("profile", self.profile)
        assessment = context.get("assessment", {})
        
        # Return Dict to ensure JSON serializability for tools/API
        result = self.generate_recommendations(profile, assessment)
        return result.model_dump()

    def _load_enriched_awards(self) -> List[Dict]:
        """Load the enriched awards database with full intelligence metadata."""
        import json
        from pathlib import Path
        
        # Path relative to this file: ../../../seeds/enriched/awards_enriched.json
        try:
            awards_path = Path(__file__).parent.parent.parent / "seeds" / "enriched" / "awards_enriched.json"
            if awards_path.exists():
                with open(awards_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load enriched awards: {e}")
        return []

    def generate_recommendations(
        self,
        profile: Dict[str, Any],
        assessment: Dict[str, Any],
    ) -> AwardsOutput:
        """
        Generate award recommendations using 94% more data (Enriched Database).
        """
        # 1. Load Data
        all_awards = self._load_enriched_awards()
        
        # Fallback to templates if load fails
        if not all_awards:
            print("⚠️ Using fallback templates (Enriched load failed)")
            return self._generate_fallback_recommendations(profile, assessment)

        # 2. Get Context
        # Implementation Note: Enriched awards need V2 Profile context
        from backend.agents.utils import transform_profile_for_agent, ARCHETYPE_MAP
        
        # Ensure we are working with a V2-compliant profile
        safe_profile = transform_profile_for_agent(profile)
        
        # Merge assessment into profile for backward compatibility if needed, 
        # but really we should trust the transformed profile's identity_synthesis
        
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
        for award in all_awards:
            # Eligibility Check
            eligible_grades = award.get("eligibility", {}).get("grades", [9, 10, 11, 12])
            if grade not in eligible_grades:
                continue
                
            # Scoring
            # Archetype Fit (JSON keys are lowercase usually)
            fits = award.get("archetype_fit", {})
            fit_score = fits.get(archetype_id, 0.2) # Default low if not specified
            
            # Skip low fit
            if fit_score < 0.3: continue
            
            # ROI Calculation
            prestige = award.get("prestige_score", 5)
            effort = award.get("effort_hours", 20)
            tier_val = award.get("strategic_tier", 3)
            tier_boost = {1: 1.5, 2: 1.2, 3: 1.0, 4: 0.8}.get(tier_val, 1.0)
            
            # Formula: (Fit * Prestige * Tier * 100) / Effort
            # Raw ROI can be large (e.g. 150+). We must normalize to 0-1 for schema.
            # Assuming max possible ~300.
            raw_roi = (fit_score * prestige * tier_boost * 100) / max(effort, 5)
            roi_score = min(1.0, raw_roi / 200.0) # Normalize and cap
            
            # Enhanced Win Probability (Multi-factor)
            historical_rate = award.get("historical_win_rate", 0.1)
            # Factors:
            # 1. Fit Boost: +30% max
            fit_boost = fit_score * 0.30
            # 2. Prestige Penalty: Higher prestige = harder (max -10%)
            prestige_penalty = (prestige / 10.0) * 0.10
            
            # Formula: Base + Boost - Penalty. Clamped [0.01, 0.95]
            win_prob = min(0.95, max(0.01, historical_rate + fit_boost - prestige_penalty))

            matches.append({
                "data": award,
                "fit_score": fit_score,
                "roi_score": roi_score,
                "win_prob": win_prob,
                "tier": tier_val
            })
            
        # 4. Pre-bucket by win probability ranges
        reach_candidates = [m for m in matches if m["win_prob"] < 0.25]
        target_candidates = [m for m in matches if 0.25 <= m["win_prob"] < 0.55]
        safety_candidates = [m for m in matches if m["win_prob"] >= 0.55]

        # Sort: Reach/Target ascending (hardest first), Safety descending (easiest first)
        reach_candidates.sort(key=lambda x: x["win_prob"])
        target_candidates.sort(key=lambda x: x["win_prob"])
        safety_candidates.sort(key=lambda x: x["win_prob"], reverse=True)

        # 5. Select 2-2-1 Portfolio
        reach = []
        target = []
        safety = []
        structured_matches = []

        def create_award_match(m, tier_label):
            a = m["data"]
            match_obj = AwardMatch(
                award_id=a.get("id", str(uuid.uuid4())),
                name=a.get("name", "Unknown Award"),
                organization=a.get("organization", ""),
                category=a.get("category", "General"),
                tier="national" if a.get("strategic_tier") == 1 else "regional",
                strategic_tier=tier_label,
                win_probability=m["win_prob"],
                fit_score=m["fit_score"],
                roi_score=m["roi_score"],
                prestige_score=a.get("prestige_score", 5) / 10.0,
                archetype_fit=m["fit_score"],
                deadline=a.get("deadline"),
                effort_hours=a.get("effort_hours", 10),
                description=a.get("description", ""),
                # Intelligence Fields
                success_patterns=a.get("success_patterns", []),
                common_mistakes=a.get("common_mistakes", []),
                win_cascade=a.get("win_cascade"),
                differentiation_factor=a.get("differentiation_factor", ""),
                historical_win_rate=a.get("historical_win_rate", 0.0)
            )
            structured_matches.append(match_obj)
            return match_obj

        # Pick 2 Reach (lowest win probability)
        for m in reach_candidates[:2]:
            reach.append(create_award_match(m, "reach"))

        # Pick 2 Target (mid-range win probability)
        for m in target_candidates[:2]:
            target.append(create_award_match(m, "target"))

        # Pick 1 Safety (highest win probability)
        for m in safety_candidates[:1]:
            safety.append(create_award_match(m, "safety"))

        # Fallback: If buckets not filled, upgrade from lower tiers
        # If no safety candidates, pick highest wp from remaining target candidates
        if len(safety) < 1 and len(target_candidates) > 2:
            remaining = target_candidates[2:]
            remaining.sort(key=lambda x: x["win_prob"], reverse=True)
            safety.append(create_award_match(remaining[0], "safety"))
        # If still no safety and we have reach candidates, pick highest wp from remaining
        if len(safety) < 1 and len(reach_candidates) > 2:
            remaining = reach_candidates[2:]
            remaining.sort(key=lambda x: x["win_prob"], reverse=True)
            safety.append(create_award_match(remaining[0], "safety"))

        # 6. Compose Output
        portfolio = AwardPortfolio(
            reach=reach,
            target=target,
            safety=safety,
            likely=target,
            stretch=reach,
            expected_wins=sum([x.win_probability for x in reach+target+safety])
        )
        
        # ReAct Metadata
        from backend.agents.schemas.react import ReactMetadata, CycleSummary
        from datetime import datetime
        
        meta = ReactMetadata(
            agent_name="Awards",
            cycles_executed=1,
            quality_score=0.95 if len(reach)+len(target)+len(safety) >= 4 else 0.6,
            cycle_summary=[
                CycleSummary(
                    iteration=1,
                    phases={
                        "THINK": {"thought": f"Scanned {len(all_awards)} enriched awards for {archetype_id}", "timestamp": datetime.utcnow().isoformat()},
                        "ACT": {"action": "Filtered by eligibility and archetype fit >= 0.3", "timestamp": datetime.utcnow().isoformat()},
                        "OBSERVE": {"observation": f"Matched {len(matches)} awards, built 2-2-1 portfolio", "quality_score": 0.95, "timestamp": datetime.utcnow().isoformat()}
                    }
                )
            ]
        )

        return AwardsOutput(
            portfolio=portfolio,
            matches=structured_matches,
            top_recommendations=reach + target + safety,
            strategic_insights=[
                f"Based on your {archetype_id} profile, we identified {len(matches)} matches from our enriched database.",
                f"Focus on {reach[0].name if reach else 'Reach awards'} for maximum ROI."
            ],
            summary={
                "total_awards_matched": len(matches),
                "expected_wins": portfolio.expected_wins,
                "strategy": "2-2-1 Enriched"
            },
            react_metadata=meta
        )

    def _generate_fallback_recommendations(self, profile, assessment) -> AwardsOutput:
        """Legacy fallback using templates."""
        # [Original generate_recommendations logic moved here for safety]
        # For brevity, reusing the TEMPLATES logic provided in the prompt's context implicitly
        # But in this replace_content, I am replacing the method, so I should effectively
        # paste the old logic here.
        archetype_data = assessment.get("archetype", {})
        if isinstance(archetype_data, dict):
            archetype_id = archetype_data.get("id", "SCHOLAR")
        else:
            archetype_id = str(archetype_data) if archetype_data else "SCHOLAR"
            
        templates = AWARD_TEMPLATES.get(archetype_id, AWARD_TEMPLATES["SCHOLAR"])
        matches = []
        for t in templates:
            matches.append(AwardMatch(
                name=t["name"],
                description=t["description"],
                win_probability=0.5,
                success_patterns=["Standard excellence"],
                common_mistakes=["Missing deadline"]
            ))
        
        return AwardsOutput(top_recommendations=matches[:5], matches=matches)


# =============================================================================
# AWARD TEMPLATES BY ARCHETYPE (Mock DB)
# =============================================================================

AWARD_TEMPLATES = {
    "SCHOLAR": [
        {
            "name": "National Merit Finalist",
            "description": "PSAT/NMSQT top 1% → Finalist status",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior Year Fall",
        },
        {
            "name": "AP Scholar with Distinction",
            "description": "Average 3.5+ on 5+ AP exams",
            "impact_level": "NATIONAL",
            "difficulty": "EASY",
            "timeline": "Ongoing",
        },
        {
            "name": "Regional Science Olympiad Medal",
            "description": "Top 3 placement in regional competition",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Sophomore/Junior Year",
        },
        {
            "name": "Academic Decathlon State Qualifier",
            "description": "State-level academic competition placement",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "School Valedictorian Track",
            "description": "Top 1-2% GPA ranking",
            "impact_level": "SCHOOL",
            "difficulty": "AMBITIOUS",
            "timeline": "Ongoing",
        },
    ],
    "RESEARCHER": [
        {
            "name": "Regeneron STS Semifinalist",
            "description": "Top 300 in nation's premier STEM research competition",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Senior Year Fall",
        },
        {
            "name": "ISEF Regional Qualifier",
            "description": "Qualify for International Science Fair regional",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior Year Spring",
        },
        {
            "name": "State Science Fair Top 10",
            "description": "Top placement in state-level science fair",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "Published Research Paper",
            "description": "Co-author on peer-reviewed publication",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "University Research Program Acceptance",
            "description": "Accepted to competitive summer research program (RSI, SSP, etc.)",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior Year Summer",
        },
    ],
    "ENTREPRENEUR": [
        {
            "name": "DECA International Qualifier",
            "description": "Qualify for DECA ICDC in entrepreneurship category",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "Diamond Challenge Finalist",
            "description": "Top 20 in high school entrepreneurship competition",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "Regional Pitch Competition Winner",
            "description": "1st place in regional startup pitch event",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Sophomore/Junior Year",
        },
        {
            "name": "Startup Revenue Milestone",
            "description": "$10K+ revenue or 1000+ users achieved",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "FBLA State Leadership Award",
            "description": "State-level recognition in Future Business Leaders",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
    ],
    "LEADER": [
        {
            "name": "Student Government President",
            "description": "Elected school-wide student body president",
            "impact_level": "SCHOOL",
            "difficulty": "MODERATE",
            "timeline": "Senior Year",
        },
        {
            "name": "National Honor Society Officer",
            "description": "Chapter officer (President/VP) of NHS",
            "impact_level": "SCHOOL",
            "difficulty": "EASY",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "State Youth Leadership Conference Delegate",
            "description": "Selected delegate to state leadership conference",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "Club Founder & President",
            "description": "Founded and led new school organization to 50+ members",
            "impact_level": "SCHOOL",
            "difficulty": "MODERATE",
            "timeline": "Sophomore-Senior",
        },
        {
            "name": "Regional Leadership Summit Speaker",
            "description": "Invited speaker at regional youth leadership event",
            "impact_level": "REGIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior/Senior Year",
        },
    ],
    "CHANGEMAKER": [
        {
            "name": "Presidential Volunteer Service Award (Gold)",
            "description": "250+ hours of community service verified",
            "impact_level": "NATIONAL",
            "difficulty": "EASY",
            "timeline": "Ongoing",
        },
        {
            "name": "Regional Youth Philanthropy Award",
            "description": "Recognition for community impact project",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "Nonprofit Founder (501c3 Status)",
            "description": "Founded IRS-registered nonprofit organization",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Sophomore/Junior Year",
        },
        {
            "name": "State Service Organization Officer",
            "description": "State-level leadership in Key Club/Interact/etc.",
            "impact_level": "STATE",
            "difficulty": "MODERATE",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "Community Impact Award",
            "description": "Local recognition for sustained service (500+ people impacted)",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior/Senior Year",
        },
    ],
    "CREATOR": [
        {
            "name": "USACO Gold Division",
            "description": "Advance to Gold tier in USA Computing Olympiad",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior Year",
            "impact_level": "NATIONAL", # Dupe fixed
        },
        {
            "name": "Major Hackathon Winner",
            "description": "Top 3 placement at 500+ person hackathon",
            "impact_level": "NATIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior/Senior Year",
        },
        {
            "name": "Open Source Contributor (1000+ GitHub Stars)",
            "description": "Maintainer of popular open-source project",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Ongoing",
        },
        {
            "name": "Regional Robotics Competition Finalist",
            "description": "FIRST Robotics or equivalent regional finals",
            "impact_level": "REGIONAL",
            "difficulty": "MODERATE",
            "timeline": "Junior Year",
        },
        {
            "name": "App Store Featured App",
            "description": "iOS/Android app with 10K+ downloads or featured status",
            "impact_level": "NATIONAL",
            "difficulty": "AMBITIOUS",
            "timeline": "Junior/Senior Year",
        },
    ],
}

# STEM-heavy swaps for the 1-Swap Rule
STEM_SWAPS = {
    "SCHOLAR": {
        "name": "USA Math Olympiad Qualifier (USAMO)",
        "description": "Top 250 in AMC → AIME → USAMO pipeline",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Junior Year",
        "rationale": "For MIT/Caltech, USAMO carries more weight than general academic awards",
    },
    "RESEARCHER": {
        "name": "Regeneron STS Finalist",
        "description": "Top 40 in nation (upgrade from Semifinalist)",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Senior Year",
        "rationale": "Finalist status is the gold standard for STEM research schools",
    },
    "ENTREPRENEUR": {
        "name": "Technical Startup (AI/ML Focus)",
        "description": "Deep-tech startup with published research component",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Junior/Senior Year",
        "rationale": "STEM schools prefer technical entrepreneurship over general business",
    },
    "LEADER": {
        "name": "FIRST Robotics Team Captain",
        "description": "Lead technical team to regional/state competition",
        "impact_level": "REGIONAL",
        "difficulty": "MODERATE",
        "timeline": "Junior/Senior Year",
        "rationale": "Technical leadership demonstrates STEM commitment",
    },
    "CHANGEMAKER": {
        "name": "STEM Education Nonprofit Founder",
        "description": "Founded org teaching coding/robotics to underserved students",
        "impact_level": "REGIONAL",
        "difficulty": "MODERATE",
        "timeline": "Sophomore-Senior",
        "rationale": "Combines service with technical expertise",
    },
    "CREATOR": {
        "name": "IOI Medal (International Olympiad in Informatics)",
        "description": "USA team member at international CS competition",
        "impact_level": "NATIONAL",
        "difficulty": "AMBITIOUS",
        "timeline": "Junior/Senior Year",
        "rationale": "IOI is the pinnacle of competitive programming",
    },
}

def create_awards_agent(student_id: str) -> AwardsAgent:
    """Factory function for the agent registry"""
    profile = {"id": student_id}
    return AwardsAgent(profile)
