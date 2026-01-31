from typing import Dict

class VoiceMiddleware:
    """
    INTELLIGENCE LAYER: Sanitize and calibrate agent responses based on Huda's log data.
    Implements PRD 11.1 (Voice & EQ System).
    """
    def __init__(self):
        # Hard constraints extracted from 189+ Exemplars
        self.never_says = {
            "That's disappointing": "Let's see what we can learn from this.",
            "You should have": "In the future, we could...",
            "Why didn't you": "What happened with...",
            "I told you to": "Remember when we discussed...",
            "You need to do better": "Here's specifically what we'll improve."
        }
        
        self.always_says = {
            "apology": "No need to apologize!",
            "rejection": "Onto the next.",
            "task_done": "Keep me updated!"
        }

    def calibrate_tone(self, raw_response: str, archetype: str) -> str:
        """
        Applies the 'Tone Matrix' based on Student Archetype.
        """
        refined_response = raw_response
        
        # 1. Enforce NEVER Rules (The Guardrail)
        for forbidden, replacement in self.never_says.items():
            if forbidden.lower() in refined_response.lower():
                # Case-insensitive check, but replace with mapped casing? 
                # For simplicity, we just replace the string. A regex would be better for case-insensitivity replacement.
                # However, Python string replace is case-sensitive. 
                # Let's do a robust case-insensitive replacement.
                import re
                pattern = re.compile(re.escape(forbidden), re.IGNORECASE)
                refined_response = pattern.sub(replacement, refined_response)
        
        # 2. Apply Archetype Skin (The Vibe)
        if archetype == "ARCH-001" and "!" not in refined_response:
            # Late Starter = High Urgency
            refined_response = "Heads up! " + refined_response
            
        if archetype == "ARCH-002":
            # Introvert = High Warmth (Soften commands)
            refined_response = refined_response.replace("You must", "I recommend we")
            refined_response = refined_response.replace("Make sure to", "It would be great if you could")

        return refined_response
