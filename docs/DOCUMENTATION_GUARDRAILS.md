# Documentation Guardrails - IvyLevel v3.0

**Created**: 2026-01-29  
**Status**: ACTIVE REQUIREMENT

---

## 🚨 CRITICAL REQUIREMENT

**ALL documentation for this project MUST be stored in TWO locations:**

### 1. Brain Folder (Conversation Context)
```
/Users/snazir/.gemini/antigravity/brain/d657f82d-3589-46f4-8250-a6153ca4df61/
```

### 2. Project `/docs` Directory (Persistent Storage)
```
/Users/snazir/ivylevel-agno-agents-v3/docs/
```

---

## 📋 Mandatory Process

### When Creating New Documentation:

1. **Create in brain folder first**
   - Use lowercase_with_underscores.md naming
   - Include artifact metadata
   - This ensures conversation context is maintained

2. **Copy to `/docs` directory**
   - Use UPPERCASE_WITH_UNDERSCORES.md naming
   - Maintain same content
   - This ensures project persistence

3. **Verify both locations**
   - Check file exists in both places
   - Confirm content is identical

### Example Commands:

```bash
# After creating in brain folder
cp /Users/snazir/.gemini/antigravity/brain/d657f82d-3589-46f4-8250-a6153ca4df61/new_feature_spec.md \
   /Users/snazir/ivylevel-agno-agents-v3/docs/NEW_FEATURE_SPEC.md

# Verify
ls -lh /Users/snazir/ivylevel-agno-agents-v3/docs/
```

---

## ✅ Document Types Covered

This requirement applies to:

- ✅ Technical specifications
- ✅ Architecture documents
- ✅ Implementation plans
- ✅ Walkthroughs
- ✅ Bug reports
- ✅ Analysis documents
- ✅ API documentation
- ✅ Testing guides
- ✅ Integration guides
- ✅ Any markdown documentation

---

## 📊 Current Compliance Status

| Document | Brain Folder | `/docs` | Status |
|----------|--------------|---------|--------|
| agno_multiagent_tech_spec.md | ✅ | ✅ AGNO_MULTIAGENT_TECH_SPEC.md | ✅ Compliant |
| multiagent_fallback_analysis.md | ✅ | ✅ MULTIAGENT_FALLBACK_ANALYSIS.md | ✅ Compliant |
| AGENT_AUTONOMY_AND_BEHAVIORS.md | ❌ | ✅ | ⚠️ Needs brain copy |

---

## 🔄 Sync Workflow

### For Updates:

1. Update in brain folder (if working in conversation)
2. Copy updated version to `/docs`
3. Verify both are in sync

### For New Documents:

1. Create in brain folder with `write_to_file` (IsArtifact=true)
2. Run `cp` command to copy to `/docs`
3. Confirm with `ls -lh docs/`

---

## ⚠️ Enforcement

**This is a STRICT requirement**. Any coding agent working on this project must:

1. Check this file before creating documentation
2. Follow the dual-storage process
3. Verify compliance after document creation
4. Update both locations when making changes

**Failure to comply** means documentation may be lost when conversation context expires.

---

## 📁 Naming Conventions

### Brain Folder:
- Format: `lowercase_with_underscores.md`
- Examples:
  - `agno_multiagent_tech_spec.md`
  - `agent_autonomy_and_behaviors.md`
  - `multiagent_fallback_analysis.md`

### `/docs` Directory:
- Format: `UPPERCASE_WITH_UNDERSCORES.md`
- Examples:
  - `AGNO_MULTIAGENT_TECH_SPEC.md`
  - `AGENT_AUTONOMY_AND_BEHAVIORS.md`
  - `MULTIAGENT_FALLBACK_ANALYSIS.md`

---

## 🎯 Quick Reference

**Brain Folder Path**:
```
/Users/snazir/.gemini/antigravity/brain/d657f82d-3589-46f4-8250-a6153ca4df61/
```

**Project `/docs` Path**:
```
/Users/snazir/ivylevel-agno-agents-v3/docs/
```

**Copy Command Template**:
```bash
cp /Users/snazir/.gemini/antigravity/brain/d657f82d-3589-46f4-8250-a6153ca4df61/[filename].md \
   /Users/snazir/ivylevel-agno-agents-v3/docs/[FILENAME].md
```

---

*This is a permanent requirement for the IvyLevel v3.0 project.*
