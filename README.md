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
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── critic.py
│   │   ├── debate_orchestrator.py
│   │   ├── master_controller.py
│   │   ├── master_orchestrator.py
│   │   ├── memory_engine.py
│   │   ├── orchestrator.py
│   │   ├── reasoner.py
│   │   ├── reasoner_b.py
│   │   ├── referee.py
│   │   └── workflow_engine.py
│   ├── config.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/page.tsx
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── home/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentMessage.tsx
│   │   │   ├── AnalysisCard.tsx
│   │   │   ├── ConfidenceBar.tsx
│   │   │   ├── DebateHistoryPanel.tsx
│   │   │   ├── DebateMessage.tsx
│   │   │   ├── DebateStatsPanel.tsx
│   │   │   ├── FinalAnswer.tsx
│   │   │   ├── FinalVerdict.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── RoundHeader.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   ├── WorkflowVisualization.tsx
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── canvas.tsx
│   │   │       ├── contact-2.tsx
│   │   │       ├── feature-section-with-hover-effects.tsx
│   │   │       ├── footer.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       └── textarea.tsx
│   │   ├── lib/utils.ts
│   │   └── types/index.ts
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🔧 Configuration

Edit `backend/config.py` to customize:
- `FREE_TIER_MODE`: Toggle between free/paid OpenRouter tier
- `MAX_DEBATE_ROUNDS`: Number of debate rounds
- `MAX_AGENTS_*`: Maximum agents per complexity level

## 📝 License

MIT License
