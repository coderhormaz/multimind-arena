"""
Configuration settings for the Master Controller Multi-Agent AI System
PAID MODE - Full multi-agent capabilities enabled!
- 1000 requests/day with $10+ credits
- 20 requests/minute
"""
import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

# ============================================================
# PAID MODE - Full features enabled!
# ============================================================
FREE_TIER_MODE = False  # Disabled - you have credits!

# System Configuration - Full features
MAX_DEBATE_ROUNDS = 2  # Enable debate rounds
MAX_SELF_CORRECTION_LOOPS = 1  # Enable self-correction
MIN_CONFIDENCE_THRESHOLD = 70  # Higher quality threshold
MEMORY_ENABLED = True  # Enable memory

# Rate Limiting - Still respect 20 req/min
API_CALL_DELAY = 3.0  # 3 seconds between calls (safe for 20/min)
MAX_AGENTS_SIMPLE = 2  # 2 agents for simple
MAX_AGENTS_MODERATE = 3  # 3 agents for moderate
MAX_AGENTS_COMPLEX = 4  # 4 agents for complex

# Complexity Thresholds
COMPLEXITY_THRESHOLDS = {
    "simple": 30,    # Quick queries
    "moderate": 60,  # Normal queries
    "complex": 100   # Complex queries
}

# Master Controller Model Configuration (Orchestrates Everything)
MASTER_CONTROLLER = {
    "id": "meta-llama/llama-3.3-70b-instruct:free",
    "name": "Master Controller",
    "role": "Workflow Orchestrator",
    "description": "Analyzes queries, designs workflows, chooses agents, manages execution",
    "temperature": 0.3,
    "color": "#8B5CF6",  # Purple
    "icon": "🧠",
    "capabilities": ["query_analysis", "workflow_design", "agent_selection", "sub_agent_creation"]
}

# Specialized Agent Models (Free Tier)
AGENTS = {
    # TEMPORARILY DISABLED - Gemini rate limiting issues
    # "gemini": {
    #     "id": "google/gemini-2.0-flash-exp:free",
    #     "name": "Gemini Flash",
    #     "role": "Fast Reasoner",
    #     "description": "Quick, efficient reasoning for initial analysis",
    #     "temperature": 0.7,
    #     "color": "#10B981",  # Green
    #     "icon": "⚡",
    #     "capabilities": ["fast_reasoning", "general_knowledge", "creative_thinking"],
    #     "speed": "fast",
    #     "depth": "moderate"
    # },
    "deepseek": {
        "id": "tngtech/deepseek-r1t-chimera:free",
        "name": "DeepSeek Chimera",
        "role": "Deep Analyzer",
        "description": "Step-by-step deep analysis for complex problems",
        "temperature": 0.5,
        "color": "#3B82F6",  # Blue
        "icon": "🔬",
        "capabilities": ["deep_analysis", "step_by_step", "mathematical_reasoning"],
        "speed": "slow",
        "depth": "deep"
    },
    "qwen_coder": {
        "id": "qwen/qwen3-coder:free",
        "name": "Qwen Coder",
        "role": "Code Specialist",
        "description": "Expert in coding, algorithms, and technical implementation",
        "temperature": 0.4,
        "color": "#F59E0B",  # Amber
        "icon": "💻",
        "capabilities": ["coding", "algorithms", "debugging", "tool_execution"],
        "speed": "moderate",
        "depth": "deep"
    },
    "gpt_critic": {
        "id": "openai/gpt-oss-20b:free",
        "name": "GPT Critic",
        "role": "Error Detector",
        "description": "Specialized in finding errors, inconsistencies, and scoring quality",
        "temperature": 0.3,
        "color": "#EF4444",  # Red
        "icon": "🔍",
        "capabilities": ["error_detection", "fact_checking", "quality_scoring", "critique"],
        "speed": "fast",
        "depth": "moderate"
    },
    "llama_judge": {
        "id": "meta-llama/llama-3.3-70b-instruct:free",
        "name": "Llama Judge",
        "role": "Final Arbiter",
        "description": "Makes final decisions, synthesizes answers, resolves conflicts",
        "temperature": 0.2,
        "color": "#6366F1",  # Indigo
        "icon": "⚖️",
        "capabilities": ["arbitration", "synthesis", "final_decision", "conflict_resolution"],
        "speed": "moderate",
        "depth": "deep"
    },
    "gemma": {
        "id": "meta-llama/llama-3.3-70b-instruct:free",
        "name": "Gemma Reasoner",
        "role": "Balanced Reasoner",
        "description": "Well-rounded reasoning with good balance of speed and depth",
        "temperature": 0.6,
        "color": "#EC4899",  # Pink
        "icon": "💎",
        "capabilities": ["balanced_reasoning", "summarization", "explanation"],
        "speed": "moderate",
        "depth": "moderate"
    }
}

# Dynamic Workflow Configuration
# OPTIMIZED: Fewer agents, no parallel execution, no sub-agents
DYNAMIC_WORKFLOW_CONFIG = {
    "allow_parallel_agents": False,  # Disabled to control rate
    "max_agents_per_workflow": 2,    # Max 2 agents per query
    "min_agents_per_workflow": 1,
    "allow_agent_reuse": False,      # No reuse to save calls
    "allow_sub_agents": False,       # No sub-agents
    "task_types": [
        "initial_reasoning",
        "critique",
        "synthesize",
        "final_verdict"
    ]  # Reduced task types
}

# Query Type Detection Keywords
QUERY_KEYWORDS = {
    "coding": ["code", "function", "algorithm", "programming", "debug", "implement", "python", "javascript", "api"],
    "math": ["calculate", "solve", "equation", "mathematical", "proof", "formula"],
    "reasoning": ["why", "explain", "analyze", "reason", "logic", "argument"],
    "creative": ["write", "story", "creative", "imagine", "design"],
    "factual": ["what is", "who is", "when did", "where is", "define"],
    "comparison": ["compare", "difference", "versus", "better", "which one"]
}

# SSE Event Types
SSE_EVENTS = {
    "master_planning": "Master Controller creating workflow plan",
    "agent_start": "Agent starting task",
    "agent_thinking": "Agent processing",
    "agent_complete": "Agent finished task",
    "routing": "Routing to next agent",
    "critique": "Critic analyzing responses",
    "debate_round": "Debate round starting",
    "self_correction": "Self-correction loop triggered",
    "confidence_update": "Confidence score updated",
    "fusion": "Fusing multiple answers",
    "final_verdict": "Final answer ready",
    "memory_store": "Storing to memory",
    "complete": "Processing complete"
}

# Logging Configuration
LOGS_DIR = os.path.join(os.path.dirname(__file__), "logs")
INTERACTIONS_FILE = os.path.join(LOGS_DIR, "interactions.json")
MEMORY_FILE = os.path.join(LOGS_DIR, "memory.json")
