from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from agno.models.openai import OpenAIChat
from backend.agents.base import IvyAgent
from backend.agents.schemas import NarrativeIdentity

# =============================================================================
# OUTPUT MODELS (Legacy - kept for backward compatibility)
# =============================================================================

class NarrativeResponse(BaseModel):
    """Structured response for narrative synthesis (Legacy)."""
    brand_statement: str = Field(..., description="A powerful, one-sentence personal brand statement unique to this student.")
    narrative_dna: str = Field(..., description="The core narrative arc type (e.g. 'hero_journey', 'discovery', 'transformation').")
    first_principle: str = Field(..., description="The student's core operating principle.")
    themes: List[str] = Field(..., description="3-5 key themes for their application, specific to their story.")
    identity_seeds: List[str] = Field(..., description="3 specific essay opening hooks based on their unique background and experiences.")
    archetype_description: str = Field(..., description="A personalized description of their archetype, referencing their specific context.")


# =============================================================================
# AGENT DEFINITION
# =============================================================================

class NarrativeAgent(IvyAgent):
    """
    Tier 2 Specialist: Narrative Architect.
    Uses GenAI to synthesize a unique personal brand from profile data.
    """
    
    @property
    def agent_id(self) -> str:
        return "spec_narrative"

    @property
    def tier(self) -> int:
        return 2

    def get_model(self):
        # Override to use OpenAI GPT-4o with lower temp for structural adherence
        return OpenAIChat(id="gpt-4o", temperature=0.2)

    def get_instructions(self) -> List[str]:
        # Extract profile data
        activities = self.profile.get('activities', []) or []

        # 🆕 NEW: Extract narrative input fields (from click-based assessment cards)
        interest_areas = self.profile.get('interest_areas', []) or self.profile.get('interests', []) or []
        causes = self.profile.get('causes', []) or []
        core_values = self.profile.get('core_values', []) or self.profile.get('values', []) or []

        # 🔍 DEBUG: Log what data we're receiving
        print(f"[NarrativeAgent] Received profile keys: {list(self.profile.keys())}")
        print(f"[NarrativeAgent] interest_areas: {interest_areas}")
        print(f"[NarrativeAgent] causes: {causes}")
        print(f"[NarrativeAgent] core_values: {core_values}")

        # Determine profile richness
        has_narrative_inputs = len(interest_areas) > 0 or len(causes) > 0 or len(core_values) > 0
        has_activities = len(activities) > 0
        is_sparse = not has_narrative_inputs and not has_activities

        print(f"[NarrativeAgent] has_narrative_inputs: {has_narrative_inputs}, is_sparse: {is_sparse}")

        instructions = [
            "You are the Narrative Architect for elite college admissions.",
            "Your goal is to synthesize a student's unique 'Brand Statement' and narrative strategy.",
            "",
            "### THE FOUR PILLARS FORMULA:",
            "IDENTITY + APTITUDE + PASSION + SERVICE = UNIQUE NARRATIVE",
            "- Use their interests, causes they care about, and core values to craft a compelling story",
            "- Connect what they love (passion) with what change they want to see (service)",
            "- Ground the narrative in who they are (identity/values)",
            "",
            "### REQUIREMENTS:",
            "1. NO GENERIC TEXT. Every output must reference specific details from the student's profile.",
            "2. DEEP PERSONALIZATION: Use their specific interest areas, causes, and values.",
            "3. SYNTHESIS: Find the intersection of their interests + causes + values to create a unique positioning.",
            "4. TONE: Prestigious, authentic, and compelling. Like a Stanford admission essay.",
            "5. OUTPUT FORMAT: STRICT JSON only. No preamble.",
            "   {",
            "     'brand_statement': 'A [CORE_VALUE]-driven [ARCHETYPE] passionate about [INTEREST] who aims to [CAUSE/IMPACT]...',",
            "     'narrative_dna': 'The [Narrative Arc Type]',",
            "     'first_principle': 'The core operating principle derived from their values',",
            "     'themes': ['Theme connecting interest to impact', 'Theme from values', 'Theme from cause'],",
            "     'identity_seeds': ['Essay hook based on interest + cause intersection', 'Hook from value', 'Hook from impact aspiration'],",
            "     'archetype_description': 'Personalized description connecting all elements...'",
            "   }"
        ]

        # 🆕 NEW: Add rich narrative context from click-based cards
        if has_narrative_inputs:
            instructions.extend([
                "",
                "### 🎯 NARRATIVE SYNTHESIS INPUTS (Use These!):",
                f"Passion Interests: {interest_areas}",
                f"Causes They Care About: {causes}",
                f"Core Values: {core_values}",
                "",
                "💡 SYNTHESIS STRATEGY:",
                "- Find the INTERSECTION between interests + causes (e.g., 'AI' + 'Healthcare' = 'Health Tech Innovator')",
                "- Ground in VALUES (e.g., 'Curiosity' + 'Impact' = driven to discover solutions that matter)",
                "- Create a unique positioning that only THIS student could claim",
            ])

        if is_sparse:
            instructions.extend([
                "",
                "💡 SPARSE PROFILE STRATEGY:",
                "- This student hasn't provided much data yet.",
                "- Focus on 'HIGH POTENTIAL' and 'INTELLECTUAL CURIOSITY'.",
                "- Use terms like 'Emerging Scholar', 'Inquisitive Mind', or 'Strategic Catalyst'.",
                "- Frame their narrative around 'Growth Trajectory'.",
            ])

        instructions.extend([
            "",
            "### PROFILE CONTEXT:",
            f"Archetype: {self.archetype}",
            f"Student: {self.profile.get('first_name', 'Student')}",
            f"Grade: {self.profile.get('grade', 11)}",
        ])

        # Add V2 primitives
        if interest_areas:
            instructions.append(f"Interest Areas: {interest_areas}")
        if causes:
            instructions.append(f"Causes: {causes}")
        if core_values:
            instructions.append(f"Core Values: {core_values}")

        instructions.append(f"Goals: {self.profile.get('goals', {})}")
        instructions.append(f"Strengths: {self.profile.get('strengths', [])}")
        instructions.append(f"Challenges: {self.profile.get('challenges', [])}")

        # Add portfolio if available
        if activities:
            instructions.append(f"Extracurricular Portfolio: {activities}")

        awards = self.profile.get('awards', [])
        if awards:
            instructions.append(f"Recent Awards/Honors: {awards}")

        return instructions

    def run_synthesis(self) -> NarrativeResponse:
        """
        Run the synthesis and return structured data (Legacy).
        """
        # We build the agent dynamically
        agent = self.build()
        
        # Run with strict output schema and DIRECTIVE prompt
        response = agent.run(
            "GENERATE NARRATIVE STRATEGY JSON. Focus on the student's unique background. Output ONLY structured data with keys: brand_statement, narrative_dna, first_principle, themes, identity_seeds, archetype_description.",
            response_model=NarrativeResponse
        )
        
        return self._parse_response(response.content)
    
    def _parse_response(self, content: Any) -> NarrativeResponse:
        """Helper to safely parse string or object response."""
        if isinstance(content, NarrativeResponse):
            return content
            
        if isinstance(content, str):
            import json
            import re
            
            # Robust JSON extraction
            try:
                # Find the JSON object
                start = content.find('{')
                end = content.rfind('}') + 1
                
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    data = json.loads(json_str)
                    return NarrativeResponse(**data)
                else:
                    raise ValueError("No JSON object found")
            except Exception as e:
                print(f"❌ Failed to parse JSON from Narrative Agent: {e}")
                # Fallback to legacy string handling in generate_identity
                return content
        
        return content
    
    def generate_identity(self) -> NarrativeIdentity:
        """
        Generate NarrativeIdentity for Federation pattern.
        
        This is the method called by GamePlanAgent.
        """
        # Get the full narrative response
        narrative_result = self.run_synthesis()
        
        # Handle both string and NarrativeResponse types
        if isinstance(narrative_result, str):
            # Fallback: Create a basic NarrativeIdentity from string
            return NarrativeIdentity(
                brand_statement=narrative_result[:200] if narrative_result else "Emerging Scholar",
                narrative_dna="The Hero's Journey",
                themes=["Academic Excellence", "Leadership", "Community Impact"],
                identity_seeds=[
                    "I discovered my passion when...",
                    "The moment that changed everything was...",
                    "Looking back, I realize that..."
                ],
                archetype_alignment="Aligns with student's core strengths and interests",
            )
        
        # Normal case: narrative_result is NarrativeResponse
        # Validate and Fallback for Narrative DNA
        final_dna = narrative_result.narrative_dna
        if not final_dna or len(final_dna.strip()) < 5:
             # Fallback: Extract from brand statement or use default
             final_dna = "Developing Narrative Strategy"
             if narrative_result.brand_statement and len(narrative_result.brand_statement) > 10:
                 final_dna = narrative_result.brand_statement[:50] + "..."

        return NarrativeIdentity(
            brand_statement=narrative_result.brand_statement,
            narrative_dna=final_dna,
            themes=narrative_result.themes[:5],  # Ensure max 5
            identity_seeds=narrative_result.identity_seeds[:3],  # Ensure exactly 3
            archetype_alignment=narrative_result.archetype_description,
            # Map legacy description to required fields
            archetype_name=narrative_result.archetype_description[:30], 
            spike=narrative_result.brand_statement[:30]
        )
    
    def run(self, profile: Dict[str, Any], assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Main entry point for registry"""
        result = self.generate_identity()
        return result.model_dump()
