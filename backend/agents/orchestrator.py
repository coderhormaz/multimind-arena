"""
Orchestrator: Manages the multi-agent workflow with streaming
"""
import json
import os
from datetime import datetime
from typing import AsyncGenerator
from agents.reasoner import ReasonerAgent
from agents.critic import CriticAgent
from agents.referee import RefereeAgent
from config import INTERACTIONS_FILE, LOGS_DIR


class Orchestrator:
    """Orchestrates the multi-agent collaboration workflow"""
    
    def __init__(self):
        self.reasoner = ReasonerAgent()
        self.critic = CriticAgent()
        self.referee = RefereeAgent()
    
    async def run_pipeline(self, question: str) -> AsyncGenerator[dict, None]:
        """
        Run the full agent pipeline with streaming results.
        Yields results as each agent completes.
        """
        interaction_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamp = datetime.now().isoformat()
        
        # Stage 1: Agent A (Reasoner)
        yield {
            "stage": "agentA",
            "status": "processing",
            "agent": self.reasoner.name
        }
        
        try:
            agent_a_result = await self.reasoner.reason(question)
            yield {
                "stage": "agentA",
                "status": "complete",
                "data": agent_a_result
            }
        except Exception as e:
            yield {
                "stage": "agentA",
                "status": "error",
                "error": str(e)
            }
            return
        
        # Stage 2: Agent B (Critic)
        yield {
            "stage": "agentB",
            "status": "processing",
            "agent": self.critic.name
        }
        
        try:
            agent_b_result = await self.critic.critique(question, agent_a_result["content"])
            yield {
                "stage": "agentB",
                "status": "complete",
                "data": agent_b_result
            }
        except Exception as e:
            yield {
                "stage": "agentB",
                "status": "error",
                "error": str(e)
            }
            return
        
        # Stage 3: Referee
        yield {
            "stage": "referee",
            "status": "processing",
            "agent": self.referee.name
        }
        
        try:
            referee_result = await self.referee.judge(
                question, 
                agent_a_result["content"], 
                agent_b_result["content"]
            )
            yield {
                "stage": "referee",
                "status": "complete",
                "data": referee_result
            }
        except Exception as e:
            yield {
                "stage": "referee",
                "status": "error",
                "error": str(e)
            }
            return
        
        # Extract final answer from referee response
        final_answer = self._extract_final_answer(referee_result["content"])
        
        # Calculate total processing time
        total_time = (
            agent_a_result["processing_time"] + 
            agent_b_result["processing_time"] + 
            referee_result["processing_time"]
        )
        
        # Final result
        yield {
            "stage": "complete",
            "status": "complete",
            "final_answer": final_answer,
            "total_processing_time": round(total_time, 2)
        }
        
        # Log the interaction
        await self._log_interaction(
            interaction_id=interaction_id,
            timestamp=timestamp,
            question=question,
            agent_a_result=agent_a_result,
            agent_b_result=agent_b_result,
            referee_result=referee_result,
            final_answer=final_answer,
            total_time=total_time
        )
    
    def _extract_final_answer(self, referee_content: str) -> str:
        """Extract the final answer section from referee's response"""
        lines = referee_content.split("\n")
        in_final_answer = False
        final_answer_lines = []
        
        for line in lines:
            if "## Final Answer" in line:
                in_final_answer = True
                continue
            elif in_final_answer and line.startswith("## "):
                break
            elif in_final_answer:
                final_answer_lines.append(line)
        
        final_answer = "\n".join(final_answer_lines).strip()
        return final_answer if final_answer else "See referee's full response for the final answer."
    
    async def _log_interaction(
        self,
        interaction_id: str,
        timestamp: str,
        question: str,
        agent_a_result: dict,
        agent_b_result: dict,
        referee_result: dict,
        final_answer: str,
        total_time: float
    ):
        """Log the interaction to JSON file"""
        # Ensure logs directory exists
        os.makedirs(LOGS_DIR, exist_ok=True)
        
        interaction = {
            "id": interaction_id,
            "timestamp": timestamp,
            "question": question,
            "agents": {
                "agentA": {
                    "name": agent_a_result["agent"],
                    "model": agent_a_result["model"],
                    "response": agent_a_result["content"],
                    "processing_time": agent_a_result["processing_time"]
                },
                "agentB": {
                    "name": agent_b_result["agent"],
                    "model": agent_b_result["model"],
                    "response": agent_b_result["content"],
                    "processing_time": agent_b_result["processing_time"]
                },
                "referee": {
                    "name": referee_result["agent"],
                    "model": referee_result["model"],
                    "response": referee_result["content"],
                    "processing_time": referee_result["processing_time"]
                }
            },
            "final_answer": final_answer,
            "total_processing_time": round(total_time, 2)
        }
        
        # Load existing interactions or create new list
        interactions = []
        if os.path.exists(INTERACTIONS_FILE):
            try:
                with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                    interactions = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                interactions = []
        
        # Append new interaction
        interactions.append(interaction)
        
        # Save back to file
        with open(INTERACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(interactions, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def get_history(limit: int = 10) -> list:
        """Get recent interactions from log"""
        if not os.path.exists(INTERACTIONS_FILE):
            return []
        
        try:
            with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                interactions = json.load(f)
            return interactions[-limit:][::-1]  # Return most recent first
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    @staticmethod
    def get_stats() -> dict:
        """Get statistics from logged interactions"""
        if not os.path.exists(INTERACTIONS_FILE):
            return {
                "total_interactions": 0,
                "avg_processing_time": 0,
                "agent_stats": {}
            }
        
        try:
            with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                interactions = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {
                "total_interactions": 0,
                "avg_processing_time": 0,
                "agent_stats": {}
            }
        
        if not interactions:
            return {
                "total_interactions": 0,
                "avg_processing_time": 0,
                "agent_stats": {}
            }
        
        total = len(interactions)
        total_time = sum(i.get("total_processing_time", 0) for i in interactions)
        
        agent_a_times = [i["agents"]["agentA"]["processing_time"] for i in interactions]
        agent_b_times = [i["agents"]["agentB"]["processing_time"] for i in interactions]
        referee_times = [i["agents"]["referee"]["processing_time"] for i in interactions]
        
        return {
            "total_interactions": total,
            "avg_processing_time": round(total_time / total, 2),
            "agent_stats": {
                "agentA": {
                    "avg_time": round(sum(agent_a_times) / len(agent_a_times), 2),
                    "model": interactions[0]["agents"]["agentA"]["model"]
                },
                "agentB": {
                    "avg_time": round(sum(agent_b_times) / len(agent_b_times), 2),
                    "model": interactions[0]["agents"]["agentB"]["model"]
                },
                "referee": {
                    "avg_time": round(sum(referee_times) / len(referee_times), 2),
                    "model": interactions[0]["agents"]["referee"]["model"]
                }
            }
        }
