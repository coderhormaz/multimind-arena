"""
Master Controller Multi-Agent AI System - FastAPI Backend
Dynamic workflow orchestration with 6 specialized agents
"""
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from agents.master_orchestrator import MasterOrchestrator
from config import AGENTS, MASTER_CONTROLLER, DYNAMIC_WORKFLOW_CONFIG, MAX_DEBATE_ROUNDS

app = FastAPI(
    title="Master Controller AI System",
    description="Dynamic multi-agent orchestration with Master Controller, 6 specialized agents, and self-correction",
    version="3.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class QueryRequest(BaseModel):
    question: str

# Initialize Master Orchestrator
orchestrator = MasterOrchestrator()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Master Controller AI System",
        "version": "3.0.0",
        "master_controller": {
            "name": MASTER_CONTROLLER["name"],
            "role": MASTER_CONTROLLER["role"],
            "icon": MASTER_CONTROLLER["icon"]
        },
        "available_agents": {
            agent_id: {
                "name": agent["name"],
                "role": agent["role"],
                "icon": agent["icon"],
                "capabilities": agent["capabilities"]
            }
            for agent_id, agent in AGENTS.items()
        },
        "workflow_mode": "dynamic",
        "max_debate_rounds": MAX_DEBATE_ROUNDS
    }


@app.post("/api/query")
async def process_query(request: QueryRequest):
    """
    Process a query through the Master Controller system.
    Returns Server-Sent Events as each step completes.
    """
    if not request.question or len(request.question.strip()) < 3:
        raise HTTPException(status_code=400, detail="Question must be at least 3 characters")
    
    async def event_generator():
        try:
            async for event in orchestrator.process_query(request.question):
                yield {
                    "event": event.get("event", "update"),
                    "data": json.dumps(event.get("data", {}))
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"type": "error", "error": str(e)})
            }
    
    return EventSourceResponse(event_generator())


@app.get("/api/history")
async def get_history(limit: int = 20):
    """Get recent interaction history"""
    history = orchestrator.get_history(limit)
    return {
        "success": True,
        "count": len(history),
        "interactions": history
    }


@app.get("/api/stats")
async def get_stats():
    """Get agent performance statistics"""
    stats = orchestrator.get_agent_stats()
    return {
        "success": True,
        "stats": stats
    }


@app.get("/api/status")
async def get_status():
    """Get system status including Master Controller and agents"""
    status = orchestrator.get_system_status()
    return {
        "success": True,
        "status": status
    }


@app.get("/api/agents")
async def get_agents():
    """Get information about available agents"""
    return {
        "success": True,
        "master_controller": {
            "name": MASTER_CONTROLLER["name"],
            "role": MASTER_CONTROLLER["role"],
            "icon": MASTER_CONTROLLER["icon"],
            "color": MASTER_CONTROLLER["color"],
            "capabilities": MASTER_CONTROLLER["capabilities"]
        },
        "agents": {
            agent_id: {
                "name": agent["name"],
                "role": agent["role"],
                "icon": agent["icon"],
                "color": agent["color"],
                "capabilities": agent["capabilities"],
                "speed": agent.get("speed", "moderate"),
                "depth": agent.get("depth", "moderate")
            }
            for agent_id, agent in AGENTS.items()
        }
    }


@app.get("/api/config")
async def get_config():
    """Get system configuration"""
    return {
        "success": True,
        "workflow_mode": "dynamic",
        "max_debate_rounds": MAX_DEBATE_ROUNDS,
        "dynamic_config": DYNAMIC_WORKFLOW_CONFIG,
        "master_controller": MASTER_CONTROLLER,
        "agents": AGENTS
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
