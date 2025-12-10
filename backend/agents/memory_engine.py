"""
Memory Engine
Stores and retrieves context from previous interactions
Enables long-term memory and context-aware responses
"""
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from config import LOGS_DIR, MEMORY_FILE


class MemoryEngine:
    """
    Memory system for storing:
    - Interaction history
    - Key facts and decisions
    - Query embeddings (simplified - text-based matching)
    - Agent performance metrics
    """
    
    def __init__(self):
        self.memory_file = MEMORY_FILE
        self._ensure_memory_file()
        self.short_term_memory: List[Dict] = []  # Current session
        self.max_short_term = 20  # Max items in short-term memory
    
    def _ensure_memory_file(self):
        """Ensure memory directory and file exist"""
        os.makedirs(LOGS_DIR, exist_ok=True)
        if not os.path.exists(self.memory_file):
            with open(self.memory_file, 'w') as f:
                json.dump({
                    "interactions": [],
                    "facts": [],
                    "agent_metrics": {},
                    "query_patterns": []
                }, f, indent=2)
    
    def _load_memory(self) -> Dict:
        """Load memory from file"""
        try:
            with open(self.memory_file, 'r') as f:
                return json.load(f)
        except:
            return {"interactions": [], "facts": [], "agent_metrics": {}, "query_patterns": []}
    
    def _save_memory(self, memory: Dict):
        """Save memory to file"""
        with open(self.memory_file, 'w') as f:
            json.dump(memory, f, indent=2, default=str)
    
    async def store_interaction(self, query: str, workflow: Dict, responses: List[Dict], 
                               final_answer: Dict, metadata: Dict = None) -> str:
        """
        Store a complete interaction in memory
        Returns interaction ID
        """
        memory = self._load_memory()
        
        interaction_id = f"int_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(memory['interactions'])}"
        
        interaction = {
            "id": interaction_id,
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "workflow_name": workflow.get("workflow_name", "Unknown"),
            "workflow_strategy": workflow.get("strategy", ""),
            "complexity": workflow.get("complexity_level", "moderate"),
            "agents_used": [s.get("agent_id") for s in workflow.get("steps", [])],
            "response_count": len(responses),
            "final_confidence": final_answer.get("confidence", 0),
            "final_answer_preview": final_answer.get("content", "")[:500],
            "metadata": metadata or {}
        }
        
        memory["interactions"].append(interaction)
        
        # Keep only last 100 interactions
        if len(memory["interactions"]) > 100:
            memory["interactions"] = memory["interactions"][-100:]
        
        # Update agent metrics
        for resp in responses:
            agent_id = resp.get("agent_id", "unknown")
            if agent_id not in memory["agent_metrics"]:
                memory["agent_metrics"][agent_id] = {
                    "total_uses": 0,
                    "total_confidence": 0,
                    "average_confidence": 0
                }
            
            metrics = memory["agent_metrics"][agent_id]
            metrics["total_uses"] += 1
            metrics["total_confidence"] += resp.get("confidence", 0)
            metrics["average_confidence"] = metrics["total_confidence"] / metrics["total_uses"]
        
        # Extract and store facts
        await self._extract_facts(query, final_answer, memory)
        
        self._save_memory(memory)
        
        # Update short-term memory
        self.short_term_memory.append({
            "query": query,
            "answer_preview": final_answer.get("content", "")[:200],
            "timestamp": datetime.now().isoformat()
        })
        if len(self.short_term_memory) > self.max_short_term:
            self.short_term_memory.pop(0)
        
        return interaction_id
    
    async def _extract_facts(self, query: str, answer: Dict, memory: Dict):
        """Extract key facts from the interaction"""
        # Simple fact extraction based on keywords
        keywords = ["is", "are", "means", "defined as", "equals", "results in"]
        answer_text = answer.get("content", "").lower()
        
        for keyword in keywords:
            if keyword in answer_text:
                # Store a simplified fact
                fact = {
                    "query_topic": query[:100],
                    "timestamp": datetime.now().isoformat(),
                    "confidence": answer.get("confidence", 0)
                }
                memory["facts"].append(fact)
                break
        
        # Keep only last 50 facts
        if len(memory["facts"]) > 50:
            memory["facts"] = memory["facts"][-50:]
    
    def retrieve_relevant_context(self, query: str, max_results: int = 3) -> List[Dict]:
        """
        Retrieve relevant past interactions based on query similarity
        Uses simple keyword matching (could be enhanced with embeddings)
        """
        memory = self._load_memory()
        interactions = memory.get("interactions", [])
        
        if not interactions:
            return []
        
        # Simple keyword-based relevance scoring
        query_words = set(query.lower().split())
        scored_interactions = []
        
        for interaction in interactions:
            past_query = interaction.get("query", "").lower()
            past_words = set(past_query.split())
            
            # Calculate overlap
            common_words = query_words.intersection(past_words)
            if common_words:
                score = len(common_words) / max(len(query_words), 1)
                scored_interactions.append({
                    **interaction,
                    "relevance_score": score
                })
        
        # Sort by relevance and return top results
        scored_interactions.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_interactions[:max_results]
    
    def get_agent_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for all agents"""
        memory = self._load_memory()
        return memory.get("agent_metrics", {})
    
    def get_short_term_context(self) -> List[Dict]:
        """Get current session context"""
        return self.short_term_memory
    
    def get_interaction_history(self, limit: int = 20) -> List[Dict]:
        """Get recent interaction history"""
        memory = self._load_memory()
        interactions = memory.get("interactions", [])
        return interactions[-limit:]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics"""
        memory = self._load_memory()
        
        return {
            "total_interactions": len(memory.get("interactions", [])),
            "total_facts": len(memory.get("facts", [])),
            "agents_tracked": len(memory.get("agent_metrics", {})),
            "short_term_items": len(self.short_term_memory),
            "agent_metrics": memory.get("agent_metrics", {})
        }
    
    def build_context_prompt(self, query: str) -> str:
        """
        Build a context prompt from relevant past interactions
        To be prepended to agent prompts
        """
        relevant = self.retrieve_relevant_context(query, max_results=2)
        
        if not relevant:
            return ""
        
        context_parts = ["RELEVANT PAST CONTEXT:"]
        for item in relevant:
            context_parts.append(
                f"- Previous query: \"{item.get('query', '')[:100]}\" "
                f"(Confidence: {item.get('final_confidence', 0)}%)"
            )
        
        return "\n".join(context_parts)
    
    def clear_short_term(self):
        """Clear short-term memory (new session)"""
        self.short_term_memory = []
    
    def clear_all(self):
        """Clear all memory (factory reset)"""
        self.short_term_memory = []
        self._save_memory({
            "interactions": [],
            "facts": [],
            "agent_metrics": {},
            "query_patterns": []
        })
