# IvyLevel v3.0 - Documentation

This directory contains all technical documentation for the IvyLevel Agno Multi-Agent System.

---

## 📋 Documentation Index

### Core Technical Specifications

1. **[AGNO_MULTIAGENT_TECH_SPEC.md](./AGNO_MULTIAGENT_TECH_SPEC.md)** (45K)
   - Complete system architecture with Mermaid diagrams
   - All 10 agents documented (3 Orchestrators, 6 Specialists, 1 Intelligence)
   - 33 Pydantic schemas
   - API contracts and endpoints
   - File structure and deployment architecture

2. **[AGENT_AUTONOMY_AND_BEHAVIORS.md](./AGENT_AUTONOMY_AND_BEHAVIORS.md)** (43K)
   - Autonomous agent behaviors with code proof
   - Proactive goal-oriented actions
   - ReAct pattern implementation
   - Multi-agent communication (A2A)
   - Shared memory & context systems
   - Tool usage and function calling

3. **[MULTIAGENT_FALLBACK_ANALYSIS.md](./MULTIAGENT_FALLBACK_ANALYSIS.md)** (14K)
   - Antigravity fallback pattern analysis
   - Root cause analysis for UI behavior
   - Backend implementation guide
   - 6 endpoint stubs with examples

---

## 🚨 CRITICAL GUARDRAIL REQUIREMENT

> **MANDATORY DOCUMENTATION POLICY**
> 
> **ALL new documentation created for this project MUST be stored in TWO locations:**
> 
> 1. **Project `/docs` directory**: `/Users/snazir/ivylevel-agno-agents-v3/docs/`
> 2. **Brain artifacts folder**: `/Users/snazir/.gemini/antigravity/brain/d657f82d-3589-46f4-8250-a6153ca4df61/`
> 
> **This applies to:**
> - ✅ Technical specifications
> - ✅ Implementation plans
> - ✅ Walkthroughs
> - ✅ Bug reports
> - ✅ Analysis documents
> - ✅ API documentation
> - ✅ Architecture diagrams
> - ✅ Any markdown documentation
> 
> **Process:**
> 1. Create document in brain folder first (for conversation context)
> 2. Copy to `/docs` directory (for project persistence)
> 3. Use UPPERCASE_WITH_UNDERSCORES.md naming convention in `/docs`
> 
> **Example:**
> ```bash
> # Create in brain folder
> /Users/snazir/.gemini/antigravity/brain/.../new_feature_spec.md
> 
> # Copy to docs
> cp brain/.../new_feature_spec.md docs/NEW_FEATURE_SPEC.md
> ```

---

## 📁 Document Organization

### Naming Convention

- **Project `/docs`**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Brain folder**: `lowercase_with_underscores.md`

### Categories

**Architecture & Design**:
- System architecture
- Data flow diagrams
- Agent hierarchy
- API contracts

**Implementation**:
- Code specifications
- Implementation plans
- Integration guides
- Migration guides

**Analysis & Reports**:
- Bug reports
- Performance analysis
- Behavior analysis
- Gap analysis

**Walkthroughs**:
- Feature walkthroughs
- Testing guides
- Deployment guides
- Session summaries

---

## 🔄 Document Lifecycle

1. **Creation**: Create in brain folder with artifact metadata
2. **Storage**: Copy to `/docs` with uppercase naming
3. **Updates**: Update both locations when changes are made
4. **Archival**: Keep both versions in sync

---

## 📊 Current Documentation

| Document | Size | Category | Last Updated |
|----------|------|----------|--------------|
| AGNO_MULTIAGENT_TECH_SPEC.md | 45K | Architecture | 2026-01-29 |
| AGENT_AUTONOMY_AND_BEHAVIORS.md | 43K | Implementation | 2026-01-29 |
| MULTIAGENT_FALLBACK_ANALYSIS.md | 14K | Analysis | 2026-01-29 |

**Total**: 102K of technical documentation

---

## 🎯 Quick Links

- [Main README](../README.md)
- [Backend README](../backend/README.md) (if exists)
- [Frontend README](../frontend/README.md) (if exists)

---

## 📝 Contributing to Documentation

When creating new documentation:

1. **Use Markdown**: All docs should be `.md` format
2. **Include Diagrams**: Use Mermaid for architecture diagrams
3. **Code Proof**: Include file paths and line numbers for claims
4. **Keep Updated**: Update both locations when making changes
5. **Follow Naming**: Use UPPERCASE_WITH_UNDERSCORES.md in `/docs`

---

## ⚠️ Important Notes

- **Never delete** documentation from either location without updating both
- **Always sync** changes between brain folder and `/docs`
- **Use absolute paths** when referencing files in documentation
- **Include metadata** (version, date, author) in document headers

---

*Last Updated: 2026-01-29*  
*Version: 3.0.0*
