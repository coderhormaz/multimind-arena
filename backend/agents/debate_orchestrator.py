"""
Debate Orchestrator: Manages multi-round debate between reasoners
"""
import json
import os
from datetime import datetime
from typing import AsyncGenerator
from agents.reasoner import ReasonerAgent
from agents.reasoner_b import ReasonerBAgent
from agents.critic import CriticAgent
from agents.referee import RefereeAgent
from config import INTERACTIONS_FILE, LOGS_DIR, DEBATE_ROUNDS


class DebateOrchestrator:
    """Orchestrates multi-round debates between AI agents"""
    
    def __init__(self):
        self.reasoner_a = ReasonerAgent()
        self.reasoner_b = ReasonerBAgent()
        self.critic = CriticAgent()
        self.referee = RefereeAgent()
        self.num_rounds = DEBATE_ROUNDS
    
    async def run_debate(self, question: str) -> AsyncGenerator[dict, None]:
        """
        Run a full multi-round debate with streaming results.
        
        Flow:
        1. Round 1: Both reasoners give initial answers
        2. Critic analyzes both
        3. Round 2+: Reasoners respond to criticism
        4. Critic analyzes again
        5. Final: Referee makes decision
        """
        debate_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamp = datetime.now().isoformat()
        
        # Storage for debate history
        debate_history = []
        reasoner_a_latest = ""
        reasoner_b_latest = ""
        all_results = {
            "rounds": [],
            "critic_final": None,
            "referee": None
        }
        
        # ============ ROUND 1: Initial Reasoning ============
        yield {
            "stage": "round_start",
            "round": 1,
            "status": "starting",
            "message": "Round 1: Initial Reasoning"
        }
        
        # Reasoner A - Initial
        yield {
            "stage": "reasoner_a",
            "round": 1,
            "status": "processing",
            "agent": self.reasoner_a.name
        }
        
        try:
            reasoner_a_result = await self.reasoner_a.reason(question)
            reasoner_a_latest = reasoner_a_result["content"]
            yield {
                "stage": "reasoner_a",
                "round": 1,
                "status": "complete",
                "data": reasoner_a_result
            }
        except Exception as e:
            yield {"stage": "reasoner_a", "round": 1, "status": "error", "error": str(e)}
            return
        
        # Reasoner B - Initial
        yield {
            "stage": "reasoner_b",
            "round": 1,
            "status": "processing",
            "agent": self.reasoner_b.name
        }
        
        try:
            reasoner_b_result = await self.reasoner_b.reason(question)
            reasoner_b_latest = reasoner_b_result["content"]
            yield {
                "stage": "reasoner_b",
                "round": 1,
                "status": "complete",
                "data": reasoner_b_result
            }
        except Exception as e:
            yield {"stage": "reasoner_b", "round": 1, "status": "error", "error": str(e)}
            return
        
        # Store round 1
        round_1_data = {
            "round": 1,
            "reasoner_a": reasoner_a_result,
            "reasoner_b": reasoner_b_result,
            "critic": None
        }
        
        # Critic - Round 1
        yield {
            "stage": "critic",
            "round": 1,
            "status": "processing",
            "agent": self.critic.name
        }
        
        try:
            critic_result = await self.critic.critique_debate(
                question, reasoner_a_latest, reasoner_b_latest, 1
            )
            round_1_data["critic"] = critic_result
            yield {
                "stage": "critic",
                "round": 1,
                "status": "complete",
                "data": critic_result
            }
        except Exception as e:
            yield {"stage": "critic", "round": 1, "status": "error", "error": str(e)}
            return
        
        all_results["rounds"].append(round_1_data)
        debate_history.append(f"=== ROUND 1 ===\n\nReasoner A:\n{reasoner_a_latest}\n\nReasoner B:\n{reasoner_b_latest}\n\nCritic:\n{critic_result['content']}")
        
        # ============ SUBSEQUENT ROUNDS: Defense & Improvement ============
        for round_num in range(2, self.num_rounds + 1):
            yield {
                "stage": "round_start",
                "round": round_num,
                "status": "starting",
                "message": f"Round {round_num}: Defense & Improvement"
            }
            
            previous_critique = all_results["rounds"][-1]["critic"]["content"]
            
            # Reasoner A Defense
            yield {
                "stage": "reasoner_a",
                "round": round_num,
                "status": "processing",
                "agent": self.reasoner_a.name
            }
            
            try:
                reasoner_a_defense = await self.reasoner_a.respond_to_critique(
                    question, reasoner_a_latest, previous_critique, round_num
                )
                reasoner_a_latest = reasoner_a_defense["content"]
                yield {
                    "stage": "reasoner_a",
                    "round": round_num,
                    "status": "complete",
                    "data": reasoner_a_defense
                }
            except Exception as e:
                yield {"stage": "reasoner_a", "round": round_num, "status": "error", "error": str(e)}
                return
            
            # Reasoner B Defense
            yield {
                "stage": "reasoner_b",
                "round": round_num,
                "status": "processing",
                "agent": self.reasoner_b.name
            }
            
            try:
                reasoner_b_defense = await self.reasoner_b.respond_to_critique(
                    question, reasoner_b_latest, previous_critique, round_num
                )
                reasoner_b_latest = reasoner_b_defense["content"]
                yield {
                    "stage": "reasoner_b",
                    "round": round_num,
                    "status": "complete",
                    "data": reasoner_b_defense
                }
            except Exception as e:
                yield {"stage": "reasoner_b", "round": round_num, "status": "error", "error": str(e)}
                return
            
            # Store round data
            round_data = {
                "round": round_num,
                "reasoner_a": reasoner_a_defense,
                "reasoner_b": reasoner_b_defense,
                "critic": None
            }
            
            # Critic analysis for this round
            yield {
                "stage": "critic",
                "round": round_num,
                "status": "processing",
                "agent": self.critic.name
            }
            
            try:
                critic_result = await self.critic.critique_debate(
                    question, reasoner_a_latest, reasoner_b_latest, round_num
                )
                round_data["critic"] = critic_result
                yield {
                    "stage": "critic",
                    "round": round_num,
                    "status": "complete",
                    "data": critic_result
                }
            except Exception as e:
                yield {"stage": "critic", "round": round_num, "status": "error", "error": str(e)}
                return
            
            all_results["rounds"].append(round_data)
            debate_history.append(f"=== ROUND {round_num} ===\n\nReasoner A:\n{reasoner_a_latest}\n\nReasoner B:\n{reasoner_b_latest}\n\nCritic:\n{critic_result['content']}")
        
        # ============ FINAL CRITIQUE ============
        yield {
            "stage": "critic_final",
            "status": "processing",
            "agent": self.critic.name,
            "message": "Final Critique"
        }
        
        full_history = "\n\n".join(debate_history)
        
        try:
            critic_final = await self.critic.final_critique(question, full_history)
            all_results["critic_final"] = critic_final
            yield {
                "stage": "critic_final",
                "status": "complete",
                "data": critic_final
            }
        except Exception as e:
            yield {"stage": "critic_final", "status": "error", "error": str(e)}
            return
        
        # ============ REFEREE FINAL DECISION ============
        yield {
            "stage": "referee",
            "status": "processing",
            "agent": self.referee.name,
            "message": "Final Judgment"
        }
        
        try:
            referee_result = await self.referee.judge_debate(
                question, full_history, critic_final["content"]
            )
            all_results["referee"] = referee_result
            yield {
                "stage": "referee",
                "status": "complete",
                "data": referee_result
            }
        except Exception as e:
            yield {"stage": "referee", "status": "error", "error": str(e)}
            return
        
        # Extract final answer and winner
        final_answer = self._extract_final_answer(referee_result["content"])
        winner = self._extract_winner(referee_result["content"])
        
        # Calculate total time
        total_time = sum(
            r["reasoner_a"]["processing_time"] + 
            r["reasoner_b"]["processing_time"] + 
            r["critic"]["processing_time"]
            for r in all_results["rounds"]
        )
        total_time += critic_final["processing_time"] + referee_result["processing_time"]
        
        # Final completion
        yield {
            "stage": "complete",
            "status": "complete",
            "final_answer": final_answer,
            "winner": winner,
            "total_rounds": self.num_rounds,
            "total_processing_time": round(total_time, 2)
        }
        
        # Log the interaction
        await self._log_debate(
            debate_id=debate_id,
            timestamp=timestamp,
            question=question,
            rounds=all_results["rounds"],
            critic_final=critic_final,
            referee_result=referee_result,
            final_answer=final_answer,
            winner=winner,
            total_time=total_time
        )
    
    def _extract_final_answer(self, referee_content: str) -> str:
        """Extract the synthesized final answer from referee's response"""
        lines = referee_content.split("\n")
        in_final = False
        final_lines = []
        
        for line in lines:
            if "Synthesized Final Answer" in line or "Final Answer" in line:
                in_final = True
                continue
            elif in_final and (line.startswith("## ") or line.startswith("💯") or line.startswith("📈")):
                break
            elif in_final:
                final_lines.append(line)
        
        return "\n".join(final_lines).strip() or "See referee's full response for the final answer."
    
    def _extract_winner(self, referee_content: str) -> str:
        """Extract the winner from referee's verdict"""
        content_lower = referee_content.lower()
        if "winner: reasoner a" in content_lower or "winner:** reasoner a" in content_lower:
            return "Reasoner A"
        elif "winner: reasoner b" in content_lower or "winner:** reasoner b" in content_lower:
            return "Reasoner B"
        elif "winner: draw" in content_lower or "winner:** draw" in content_lower:
            return "Draw"
        return "See verdict"
    
    async def _log_debate(
        self,
        debate_id: str,
        timestamp: str,
        question: str,
        rounds: list,
        critic_final: dict,
        referee_result: dict,
        final_answer: str,
        winner: str,
        total_time: float
    ):
        """Log the complete debate to JSON file"""
        os.makedirs(LOGS_DIR, exist_ok=True)
        
        interaction = {
            "id": debate_id,
            "timestamp": timestamp,
            "type": "debate",
            "question": question,
            "num_rounds": self.num_rounds,
            "rounds": [
                {
                    "round": r["round"],
                    "reasoner_a": {
                        "name": r["reasoner_a"]["agent"],
                        "response": r["reasoner_a"]["content"],
                        "processing_time": r["reasoner_a"]["processing_time"]
                    },
                    "reasoner_b": {
                        "name": r["reasoner_b"]["agent"],
                        "response": r["reasoner_b"]["content"],
                        "processing_time": r["reasoner_b"]["processing_time"]
                    },
                    "critic": {
                        "name": r["critic"]["agent"],
                        "response": r["critic"]["content"],
                        "processing_time": r["critic"]["processing_time"]
                    }
                }
                for r in rounds
            ],
            "critic_final": {
                "name": critic_final["agent"],
                "response": critic_final["content"],
                "processing_time": critic_final["processing_time"]
            },
            "referee": {
                "name": referee_result["agent"],
                "response": referee_result["content"],
                "processing_time": referee_result["processing_time"]
            },
            "final_answer": final_answer,
            "winner": winner,
            "total_processing_time": round(total_time, 2)
        }
        
        # Load existing or create new
        interactions = []
        if os.path.exists(INTERACTIONS_FILE):
            try:
                with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                    interactions = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                interactions = []
        
        interactions.append(interaction)
        
        with open(INTERACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(interactions, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def get_history(limit: int = 10) -> list:
        """Get recent debate interactions"""
        if not os.path.exists(INTERACTIONS_FILE):
            return []
        
        try:
            with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                interactions = json.load(f)
            return interactions[-limit:][::-1]
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    @staticmethod
    def get_stats() -> dict:
        """Get debate statistics including win rates"""
        if not os.path.exists(INTERACTIONS_FILE):
            return {
                "total_debates": 0,
                "avg_processing_time": 0,
                "reasoner_a_wins": 0,
                "reasoner_b_wins": 0,
                "draws": 0,
                "agent_stats": {}
            }
        
        try:
            with open(INTERACTIONS_FILE, "r", encoding="utf-8") as f:
                interactions = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {
                "total_debates": 0,
                "avg_processing_time": 0,
                "reasoner_a_wins": 0,
                "reasoner_b_wins": 0,
                "draws": 0,
                "agent_stats": {}
            }
        
        if not interactions:
            return {
                "total_debates": 0,
                "avg_processing_time": 0,
                "reasoner_a_wins": 0,
                "reasoner_b_wins": 0,
                "draws": 0,
                "agent_stats": {}
            }
        
        total = len(interactions)
        total_time = sum(i.get("total_processing_time", 0) for i in interactions)
        
        # Count wins
        wins_a = sum(1 for i in interactions if i.get("winner") == "Reasoner A")
        wins_b = sum(1 for i in interactions if i.get("winner") == "Reasoner B")
        draws = sum(1 for i in interactions if i.get("winner") == "Draw")
        
        return {
            "total_debates": total,
            "avg_processing_time": round(total_time / total, 2) if total > 0 else 0,
            "reasoner_a_wins": wins_a,
            "reasoner_b_wins": wins_b,
            "draws": draws,
            "win_rate_a": round(wins_a / total * 100, 1) if total > 0 else 0,
            "win_rate_b": round(wins_b / total * 100, 1) if total > 0 else 0
        }
