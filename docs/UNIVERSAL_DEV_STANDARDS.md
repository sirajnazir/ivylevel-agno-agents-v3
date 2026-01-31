# Universal Development Standards - IvyLevel v3.0

**Created**: 2026-01-30
**Status**: ACTIVE MANDATE

---

## 🛡️ Core Philosophy: "Fix Once, Fix Everywhere"

When identifying a bug, error, or mismatch in one component, you MUST analyze whether the same pattern exists elsewhere in the codebase and apply the fix universally. **Patching only the immediate symptom is considered a failure.**

---

## 📋 Mandatory Coding Standards

### 1. Universal Pattern Application (The "Anti-Whac-A-Mole" Rule)
*   **Trigger**: You fix a bug caused by a structural issue (e.g., Schema mismatch, missing ID injection, incorrectly handled Enum).
*   **Action**: You MUST grep/search the codebase for other instances of similar logic and proactively apply the same fix to them.
*   **Example**: 
    *   *Scenario*: You find that `NarrativeAgent` crashes because `profile['id']` is missing.
    *   *Requirement*: You MUST checks `GamePlanAgent`, `AwardsAgent`, `ECAgent`, etc., and apply the ID injection fix to *all of them* immediately.

### 2. Comprehensive Schema Alignment
*   **Trigger**: A 422 Unprocessable Entity error occurs.
*   **Action**: 
    *   Do not just "tweak" the payload until it passes.
    *   Review the **Pydantic Model** in Backend and `interface` in Frontend.
    *   Ensure they map 1:1.
    *   If the Backend model uses inheritance (e.g., `AgentContextRequest`), verify that *optional* fields needed by specific agents (like `assessment` for Simulator) are explicitly defined in the child classes. `pass` is rarely sufficient for complex payloads.

### 3. Robust Context Injection
*   **Trigger**: An Agent or Service requires context (like `student_id`) that might be fragmented across Request Body and Query Params.
*   **Action**: 
    *   Implement recovery logic at the **Edge/Router** level.
    *   *Code Pattern*:
        ```python
        # Standard Robustness Pattern for Agent Routes
        profile = await get_context(request)
        if "id" not in profile and request.student_id:
             profile["id"] = request.student_id # Manual Injection
        ```

---

## 🔍 Verification Checklist

Before marking a task as Complete, ask:
1.  [ ] Did I fix the reported error?
2.  [ ] **matches_pattern**: Does this error stem from a repeatable pattern (copy-pasted boilerplate, shared base class usage)?
3.  [ ] **universal_sweep**: If yes, did I search for and fix all other instances?

---

*This document serves as a strict guardrail for all future development. Deviating from these standards requires explicit justification.*
