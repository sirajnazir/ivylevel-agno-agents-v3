# IMPLEMENTS: The "Jenny" Knowledge Base (Templates & Workflows) - v9.2
# Path: backend/agents/logic/execution_utils.py

from typing import Dict, List, Optional

# =============================================================================
# 1. EMAIL TEMPLATES (From EXECUTION_LIBRARY.json)
# =============================================================================

EMAIL_TEMPLATES = {
    "cold_email_professor": {
        "subject": "Research Inquiry: [Topic] - [Student Name]",
        "body": (
            "Dear Professor [Name],\n\n"
            "I'm [Name], a junior at [School] interested in [Topic]. I read your paper on [Paper Name] and "
            "was fascinated by [Specific Finding].\n\n"
            "I have experience with [Skill 1] and [Skill 2]. I was wondering if you might be open to a brief "
            "conversation about your research or potential opportunities in your lab?\n\n"
            "Attached is my resume/CV.\n\n"
            "Best regards,\n"
            "[Student Name]"
        )
    },
    "lor_emergency": {
        "subject": "URGENT: Application Submission - [Student Name]",
        "body": (
            "Dear Admissions,\n\n"
            "I am submitting my application for [Program]. Unfortunately, my recommender has not yet "
            "submitted their letter due to [Reason/Context]. They have assured me it will be submitted by [Date].\n\n"
            "Please let me know if there are any additional steps I should take.\n\n"
            "Sincerely,\n"
            "[Student Name]"
        )
    },
    "waitlist_update": {
        "subject": "Continued Interest - [Student Name]",
        "body": (
            "Dear Staff,\n\n"
            "I remain highly interested in [Program]. Since applying, I have [New Achievement/Update]. "
            "This program remains my top choice because [Specific Reason].\n\n"
            "Thank you for your continued consideration.\n\n"
            "Best,\n"
            "[Student Name]"
        )
    },
    "sponsor_email": {
        "subject": "Sponsorship Opportunity: [Project Name]",
        "body": (
            "Dear [Name/Company],\n\n"
            "I am [Name], the founder of [Project Name], a student-led initiative dedicated to [Mission]. "
            "We are planning [Event Name] and are seeking partners who share our commitment to [Value].\n\n"
            "Would you be open to discussing a potential sponsorship? We would love to feature [Company] as a partner.\n\n"
            "Sincerely,\n"
            "[Student Name]"
        )
    }
}

# =============================================================================
# 2. MICRO-WORKFLOWS (From MICRO_WORKFLOWS.md)
# =============================================================================

MICRO_WORKFLOWS = {
    "bad_grade": [
        "1. DIAGNOSE: Is it Knowledge (Tutor) or Effort (Time)?",
        "2. POLICY: Check syllabus for Retake/Correction policy.",
        "3. ACTION: Schedule Office Hours immediately.",
        "4. SCRIPT: 'I am committed to an A. What specific steps can I take locally?'"
    ],
    "essay_paralysis": [
        "1. CLOSE the document (Stop typing).",
        "2. RECORD: Speak the story into your phone for 3 minutes.",
        "3. TRANSCRIBE: Use the transcript as your rough draft.",
        "4. RULE: No backspacing allowed for 15 minutes."
    ],
    "rejection_recovery": [
        "1. EMPATHIZE: 'This sucks. It's okay to be mad.'",
        "2. EXTERNALIZE: 'This was a competitive cycle / bad LOR fit.'",
        "3. REFRAME: 'This is why we have a portfolio.'",
        "4. PIVOT: 'Let's focus on [Next Opportunity] due Tuesday.'"
    ],
    "burnout_protocol": [
        "1. HALT: Stop all work for 24 hours.",
        "2. SLEEP: 9+ hours tonight is mandatory.",
        "3. AUDIT: Drop the lowest impact activity immediately.",
        "4. RESTART: Only do ONE task tomorrow."
    ]
}

# =============================================================================
# ACCESSORS
# =============================================================================

def get_template(template_id: str) -> str:
    """Returns the raw trigger text of a template."""
    template = EMAIL_TEMPLATES.get(template_id)
    if not template:
        return "Template not found."
    return f"Subject: {template['subject']}\n\n{template['body']}"

def get_micro_workflow(trigger: str) -> List[str]:
    """Returns the step-by-step checklist for a crisis."""
    return MICRO_WORKFLOWS.get(trigger, ["No workflow found for this trigger."])
