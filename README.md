# IvyLevel v3.0 - The Execution Engine

> **Architecture:** Agno + Supabase + FastAPI  
> **Pattern:** Plug-and-Play Agent System
Key enhancements:
Agents work with coaches to:
- Surface high-leverage student signals continuously
- Recommend next actions with confidence scores and evidence
- Route high-stakes decisions to human judgment
- Preserve coach intelligence as the system's anchor

## 🏗️ The 4-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: ORCHESTRATORS                     │
│              (Strategy & Weekly Coordination)                │
│    orch_assessment  |  orch_gameplan  |  orch_execution     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TIER 2: SPECIALISTS                       │
│                   (Domain Execution)                         │
│   spec_awards  |  spec_ec  |  spec_programs  |  spec_narrative│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TIER 3: PRIMITIVES                        │
│                 (Shared Tool Functions)                      │
│         Supabase Tools  |  Vector Search  |  Utilities       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TIER 4: INTELLIGENCE                      │
│                (Context & Voice Middleware)                  │
│              intel_context  |  Voice Adapter                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
ivylevel-agno-agents-v3/
├── backend/
│   ├── agents/
│   │   ├── base.py           # IvyAgent - The Contract
│   │   ├── registry.py       # The Plug-and-Play Switchboard
│   │   ├── orchestrators/    # Tier 1
│   │   ├── specialists/      # Tier 2
│   │   ├── primitives/       # Tier 3
│   │   └── intelligence/     # Tier 4
│   ├── api/
│   │   └── routes/
│   ├── knowledge/            # RAG/Ingestion
│   ├── tools/                # Shared Utilities
│   ├── evals/
│   │   └── datasets/         # Golden Truth Data
│   ├── main.py               # FastAPI Entry Point
│   ├── memory.py             # The Hippocampus
│   └── requirements.txt
├── raw_data/
│   ├── execution_artifacts/
│   ├── strategy_frameworks/
│   └── exemplars/
├── docs/
├── .env
└── .gitignore
```

## ⚖️ The 7 Laws of Engineering

### 1. The Scalability Law (Plug-and-Play)
```python
# ❌ NEVER do this
agent = Agent(...)

# ✅ ALWAYS do this
from backend.agents.registry import load_agent
agent = load_agent("orch_assessment", student_profile)
```

### 2. Tier Discipline
- **Tier 1 (Orchestrators):** Strategy & Weekly Management
- **Tier 2 (Specialists):** Domain Execution
- **Tier 3 (Primitives):** Tools used by Agents
- **Tier 4 (Intelligence):** Context & Voice Middleware

### 3. Real Data Sovereignty
- **NO FAKER DATA**
- All tests run against `evals/datasets/huda_golden.json`

### 4. Agnostic Intelligence
- Agents **retrieve** logic from Vector DB
- Do **not** hardcode coaching advice

### 5. Type Safety
- All outputs are Pydantic models
- `structured_outputs=True` on all agents

### 6. The Golden Thread
```
models.py → schema.sql → docs/DATABASE.md
```

### 7. The Formula
```
Success = IQ × EQ × CQ × Data
```

## 🚀 Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Set up environment
cp .env.example .env  # Edit with your credentials

# 4. Run the server
python -m backend.main
```

## 🔌 Adding a New Agent

1. Create the agent class inheriting from `IvyAgent`:
```python
# backend/agents/specialists/my_agent.py
from backend.agents.base import IvyAgent

class MyAgent(IvyAgent):
    @property
    def agent_id(self) -> str:
        return "spec_my_agent"
    
    @property
    def tier(self) -> int:
        return 2
    
    def get_instructions(self) -> list:
        return ["Your instructions here"]
```

2. Add ONE line to the registry:
```python
# backend/agents/registry.py
AGENT_MAP = {
    ...
    "spec_my_agent": "backend.agents.specialists.my_agent.MyAgent",
}
```

3. Done! The agent is now available via:
```python
agent = load_agent("spec_my_agent", profile)
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root info |
| `/health` | GET | Health check |
| `/agents` | GET | List all agents |
| `/agent/invoke` | POST | Invoke an agent |

## 🧪 Running Tests

```bash
pytest backend/evals/ -v
```

## 📝 License

Proprietary - IvyLevel Inc.
