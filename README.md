# MultiMind Arena

A sophisticated multi-agent AI system where multiple specialized AI agents collaborate to answer queries, with a Master Controller orchestrating the workflow.

## 🌟 Features

- **Master Controller**: Orchestrates workflows, analyzes queries, selects appropriate agents
- **Multiple Specialized Agents**:
  - ⚡ **Gemini Flash** - Fast reasoning
  - 🔬 **DeepSeek Chimera** - Deep analysis
  - 💻 **Qwen Coder** - Code specialist
  - 🔍 **GPT Critic** - Error detection
  - ⚖️ **Llama Judge** - Final synthesis
- **Dynamic Workflow**: Automatically designs optimal workflow based on query complexity
- **Real-time Streaming**: SSE-based updates for live progress
- **Final Synthesis**: Master combines all agent insights into comprehensive answer
## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Master Controller                │
│     (Analyzes query, designs workflow)          │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌───────┐   ┌───────────┐   ┌─────────┐
│ Agent │   │   Agent   │   │  Agent  │
│   1   │   │     2     │   │    3    │
└───┬───┘   └─────┬─────┘   └────┬────┘
    │             │              │
    └─────────────┼──────────────┘
                  ▼
         ┌───────────────┐
         │  Llama Judge  │
         │  (Synthesis)  │
         └───────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- OpenRouter API Key (get one at [openrouter.ai](https://openrouter.ai))

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Run server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 📁 Project Structure

```
MultiMind Arena/
├── backend/
│   ├── agents/
│   │   ├── base.py              # Base agent with rate limiting
│   │   ├── master_controller.py # Workflow orchestration
│   │   ├── master_orchestrator.py # Main coordinator
│   │   ├── workflow_engine.py   # Executes workflows
│   │   └── memory_engine.py     # Context memory
│   ├── config.py                # Configuration
│   ├── main.py                  # FastAPI server
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx         # Main UI
│   │   ├── components/          # React components
│   │   └── types/               # TypeScript types
│   └── package.json
└── README.md
```

## 🔧 Configuration

Edit `backend/config.py` to customize:
- `FREE_TIER_MODE`: Toggle between free/paid OpenRouter tier
- `MAX_DEBATE_ROUNDS`: Number of debate rounds
- `MAX_AGENTS_*`: Maximum agents per complexity level

## 📝 License

MIT License
