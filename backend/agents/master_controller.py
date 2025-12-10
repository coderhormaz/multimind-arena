"""
Master Controller Agent
OPTIMIZED FOR FREE TIER: Uses local analysis instead of API when possible
"""
import json
import re
from typing import Dict, List, Any, Optional
from .base import BaseAgent
from config import (
    MASTER_CONTROLLER, AGENTS, DYNAMIC_WORKFLOW_CONFIG, 
    QUERY_KEYWORDS, COMPLEXITY_THRESHOLDS, FREE_TIER_MODE
)


class MasterController(BaseAgent):
    """
    Master Controller that:
    1. Analyzes incoming queries for complexity and type
    2. Designs optimal workflow plans
    3. Selects appropriate agents
    4. Creates dynamic sub-agents when needed
    5. Monitors execution and triggers self-correction
    """
    
    def __init__(self):
        super().__init__(
            model_id=MASTER_CONTROLLER["id"],
            name=MASTER_CONTROLLER["name"],
            role=MASTER_CONTROLLER["role"],
            temperature=MASTER_CONTROLLER["temperature"]
        )
        self.color = MASTER_CONTROLLER["color"]
        self.icon = MASTER_CONTROLLER["icon"]
        self.capabilities = MASTER_CONTROLLER["capabilities"]
    
    async def analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Analyze the user's query to determine type and complexity.
        FREE TIER OPTIMIZATION: Uses local keyword analysis to save API calls!
        Only calls API for truly ambiguous queries.
        """
        # FREE TIER: Always use local analysis (no API call)
        if FREE_TIER_MODE:
            print(f"[Master Controller] 🆓 Free tier: Using local analysis (saving API call)")
            return self._fallback_analysis(query)
        
        # Original API-based analysis (disabled in free tier)
        prompt = f"""You are the Master Controller AI. Analyze this query briefly.

USER QUERY: "{query}"

Respond with ONLY JSON (no markdown):
{{
    "query_type": "coding|math|reasoning|creative|factual|comparison|general",
    "complexity_score": <0-100>,
    "requires_debate": <true|false>,
    "requires_coding": <true|false>,
    "recommended_agents": ["agent_id"],
    "reasoning": "Brief explanation"
}}

Agents: {list(AGENTS.keys())}
"""
        response = await self.generate(prompt)
        
        # Parse the JSON response
        try:
            # Clean up the response - remove markdown if present
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```(?:json)?\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            analysis = json.loads(clean_response)
            
            # Validate and fill defaults
            analysis.setdefault("query_type", "general")
            analysis.setdefault("complexity_score", 50)
            analysis.setdefault("requires_debate", False)
            analysis.setdefault("requires_deep_analysis", False)
            analysis.setdefault("requires_coding", False)
            analysis.setdefault("key_concepts", [])
            analysis.setdefault("recommended_agents", ["gemini"])
            analysis.setdefault("estimated_rounds", 1)
            analysis.setdefault("reasoning", "")
            
            return analysis
            
        except json.JSONDecodeError:
            # Fallback analysis using keyword matching
            return self._fallback_analysis(query)
    
    def _fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Fallback analysis using keyword matching if LLM parsing fails"""
        query_lower = query.lower()
        
        # Detect query type
        query_type = "general"
        for qtype, keywords in QUERY_KEYWORDS.items():
            if any(kw in query_lower for kw in keywords):
                query_type = qtype
                break
        
        # Estimate complexity
        complexity = 50
        if len(query.split()) < 10:
            complexity = 25
        elif len(query.split()) > 50:
            complexity = 75
        if "?" in query and query_lower.startswith(("what", "when", "where", "who")):
            complexity -= 20
        if any(kw in query_lower for kw in ["explain", "analyze", "compare", "debate"]):
            complexity += 20
        
        complexity = max(0, min(100, complexity))
        
        # Select agents based on type
        agents = ["deepseek"]
        if query_type == "coding":
            agents = ["qwen_coder"]  # Single agent for coding
        elif query_type == "math":
            agents = ["deepseek"]  # Single agent for math
        elif query_type == "reasoning":
            agents = ["deepseek"]  # Single agent for reasoning (was gemini - temp disabled)
        elif complexity > 70:
            agents = ["deepseek", "llama_judge"]  # Max 2 agents for complex
        
        return {
            "query_type": query_type,
            "complexity_score": complexity,
            "requires_debate": False,  # No debate in free tier
            "requires_deep_analysis": False,
            "requires_coding": query_type == "coding",
            "key_concepts": [],
            "recommended_agents": agents[:1],  # Only first agent
            "estimated_rounds": 1,  # Single round
            "reasoning": "Local keyword analysis (free tier optimized)"
        }
    
    async def create_workflow_plan(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create workflow plan.
        FREE TIER: Uses local template (no API call) for 1-2 agent simple workflow
        """
        # FREE TIER: Use local workflow templates
        if FREE_TIER_MODE:
            print(f"[Master Controller] 🆓 Free tier: Using local workflow template (saving API call)")
            return self._create_simple_workflow(query, analysis)
        
        # PAID MODE: Use richer workflows with multiple agents
        print(f"[Master Controller] 💰 Paid mode: Creating multi-agent workflow")
        return self._create_paid_workflow(query, analysis)
    
    def _create_paid_workflow(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create a multi-agent workflow for paid tier - always uses 2+ agents"""
        query_type = analysis.get("query_type", "general")
        complexity = analysis.get("complexity_score", 50)
        
        # Select primary and secondary agents based on query type
        # NOTE: Gemini temporarily disabled due to rate limiting
        if query_type == "coding":
            primary_agent = "qwen_coder"
            secondary_agent = "gpt_critic"
        elif query_type == "math":
            primary_agent = "deepseek"
            secondary_agent = "llama_judge"
        elif query_type == "reasoning":
            primary_agent = "deepseek"
            secondary_agent = "llama_judge"
        else:
            primary_agent = "deepseek"
            secondary_agent = "llama_judge"
        
        # Always use 2 agents + synthesis
        steps = [
            {
                "step_number": 1,
                "agent_id": primary_agent,
                "task": "initial_reasoning",
                "instruction": f"Analyze and answer this query thoroughly: {query[:200]}",
                "depends_on": [],
                "agent_name": AGENTS[primary_agent]["name"],
                "agent_role": AGENTS[primary_agent]["role"],
                "icon": AGENTS[primary_agent]["icon"],
                "color": AGENTS[primary_agent]["color"]
            },
            {
                "step_number": 2,
                "agent_id": secondary_agent,
                "task": "deep_analysis",
                "instruction": f"Provide additional analysis, verify facts, add insights: {query[:200]}",
                "depends_on": [1],
                "agent_name": AGENTS[secondary_agent]["name"],
                "agent_role": AGENTS[secondary_agent]["role"],
                "icon": AGENTS[secondary_agent]["icon"],
                "color": AGENTS[secondary_agent]["color"]
            }
        ]
        
        # For complex queries, add a third agent
        if complexity > 60:
            steps.append({
                "step_number": 3,
                "agent_id": "gpt_critic",
                "task": "critique",
                "instruction": "Review previous responses, identify errors or gaps, suggest improvements",
                "depends_on": [1, 2],
                "agent_name": AGENTS["gpt_critic"]["name"],
                "agent_role": AGENTS["gpt_critic"]["role"],
                "icon": AGENTS["gpt_critic"]["icon"],
                "color": AGENTS["gpt_critic"]["color"]
            })
        
        # Build agent configs
        agent_configs = {}
        for step in steps:
            aid = step["agent_id"]
            if aid not in agent_configs:
                agent_configs[aid] = AGENTS[aid].copy()
        
        return {
            "workflow_name": f"Multi-Agent {query_type.title()} Workflow",
            "strategy": f"Using {len(steps)} agents with final synthesis",
            "complexity_level": "simple" if complexity <= 40 else ("moderate" if complexity <= 70 else "complex"),
            "debate_enabled": False,
            "debate_rounds": 0,
            "steps": steps,
            "agent_configs": agent_configs,
            "fusion_strategy": "judge_picks",  # Master synthesizes ALL responses
            "success_criteria": "Comprehensive, accurate response combining all agent insights",
            "total_expected_calls": len(steps) + 1,  # +1 for synthesis
            "paid_mode": True
        }
    
    def _create_simple_workflow(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create a simple 1-2 agent workflow locally without API call (FREE TIER)"""
        query_type = analysis.get("query_type", "general")
        complexity = analysis.get("complexity_score", 50)
        
        # Select best single agent for the task
        # NOTE: Gemini temporarily disabled due to rate limiting
        if query_type == "coding":
            primary_agent = "qwen_coder"
        elif query_type == "math":
            primary_agent = "deepseek"
        elif query_type == "reasoning":
            primary_agent = "deepseek"
        else:
            primary_agent = "deepseek"  # Default (was gemini - temp disabled)
        
        # Build simple workflow - just 1 agent for most queries
        steps = [{
            "step_number": 1,
            "agent_id": primary_agent,
            "task": "initial_reasoning",
            "instruction": f"Answer this query thoroughly: {query[:200]}",
            "depends_on": [],
            "agent_name": AGENTS[primary_agent]["name"],
            "agent_role": AGENTS[primary_agent]["role"],
            "icon": AGENTS[primary_agent]["icon"],
            "color": AGENTS[primary_agent]["color"]
        }]
        
        # Only add judge for complex queries (saves 1 API call otherwise)
        if complexity > 70:
            steps.append({
                "step_number": 2,
                "agent_id": "llama_judge",
                "task": "final_verdict",
                "instruction": "Review and provide final synthesized answer",
                "depends_on": [1],
                "agent_name": AGENTS["llama_judge"]["name"],
                "agent_role": AGENTS["llama_judge"]["role"],
                "icon": AGENTS["llama_judge"]["icon"],
                "color": AGENTS["llama_judge"]["color"]
            })
        
        # Build agent configs
        agent_configs = {}
        for step in steps:
            aid = step["agent_id"]
            if aid not in agent_configs:
                agent_configs[aid] = AGENTS[aid].copy()
        
        return {
            "workflow_name": f"Simple {query_type.title()} Workflow",
            "strategy": "Direct single-agent response (free tier optimized)",
            "complexity_level": "simple" if complexity <= 50 else "moderate",
            "debate_enabled": False,
            "debate_rounds": 0,
            "steps": steps,
            "agent_configs": agent_configs,
            "fusion_strategy": "judge_picks",  # Always synthesize with Judge!
            "success_criteria": "Clear, accurate response",
            "total_expected_calls": len(steps),
            "free_tier_optimized": True
        }
    
    async def _create_ai_workflow(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Original AI-based workflow creation (not used in free tier)"""
        # Build agent descriptions for the prompt
        agent_descriptions = "\n".join([
            f"- {aid}: {a['name']} ({a['role']})"
            for aid, a in AGENTS.items()
        ])
        
        task_types = ", ".join(DYNAMIC_WORKFLOW_CONFIG["task_types"])
        
        prompt = f"""Design a simple workflow (max 2 steps) for this query.

QUERY: "{query[:200]}"
TYPE: {analysis.get('query_type', 'general')}

AGENTS: {agent_descriptions}

Respond with ONLY JSON:
{{
    "workflow_name": "<name>",
    "strategy": "<brief>",
    "complexity_level": "simple",
    "debate_enabled": false,
    "steps": [
        {{"step_number": 1, "agent_id": "<id>", "task": "initial_reasoning", "instruction": "<instruction>", "depends_on": []}}
    ],
    "fusion_strategy": "best_answer"
}}"""
        
        response = await self.generate(prompt)
        
        try:
            # Clean up the response
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```(?:json)?\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            workflow = json.loads(clean_response)
            
            # Enrich steps with agent config details
            enriched_steps = []
            agent_configs = {}
            
            for step in workflow.get("steps", []):
                agent_id = step.get("agent_id", "deepseek")
                if agent_id in AGENTS:
                    agent_config = AGENTS[agent_id]
                    enriched_step = {
                        **step,
                        "agent_name": agent_config["name"],
                        "agent_role": agent_config["role"],
                        "icon": agent_config["icon"],
                        "color": agent_config["color"],
                        "model_id": agent_config["id"]
                    }
                    enriched_steps.append(enriched_step)
                    agent_configs[agent_id] = agent_config
            
            workflow["steps"] = enriched_steps
            workflow["agent_configs"] = agent_configs
            workflow["total_agents"] = len(set(s["agent_id"] for s in enriched_steps))
            workflow["total_steps"] = len(enriched_steps)
            workflow["dynamically_generated"] = True
            
            return workflow
            
        except json.JSONDecodeError:
            # Fallback to simple dynamic workflow
            return self._create_fallback_workflow(query, analysis)
    
    def _create_fallback_workflow(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback workflow if AI generation fails"""
        complexity = analysis.get("complexity_score", 50)
        
        steps = []
        agent_configs = {}
        
        # Always start with fast reasoner (was gemini - temp disabled)
        deepseek = AGENTS["deepseek"]
        steps.append({
            "step_number": 1,
            "agent_id": "deepseek",
            "agent_name": deepseek["name"],
            "agent_role": deepseek["role"],
            "task": "initial_reasoning",
            "instruction": f"Analyze and provide initial answer to: {query[:200]}",
            "icon": deepseek["icon"],
            "color": deepseek["color"],
            "model_id": deepseek["id"],
            "depends_on": []
        })
        agent_configs["deepseek"] = deepseek
        
        # Add more agents based on complexity
        if complexity > 40:
            qwen = AGENTS["qwen_coder"]
            steps.append({
                "step_number": 2,
                "agent_id": "qwen_coder",
                "agent_name": qwen["name"],
                "agent_role": qwen["role"],
                "task": "deep_analysis",
                "instruction": "Provide deeper analysis and alternative perspective",
                "icon": qwen["icon"],
                "color": qwen["color"],
                "model_id": qwen["id"],
                "depends_on": [1]
            })
            agent_configs["qwen_coder"] = qwen
        
        if complexity > 60:
            critic = AGENTS["gpt_critic"]
            steps.append({
                "step_number": 3,
                "agent_id": "gpt_critic",
                "agent_name": critic["name"],
                "agent_role": critic["role"],
                "task": "critique",
                "instruction": "Critique previous responses, find errors and gaps",
                "icon": critic["icon"],
                "color": critic["color"],
                "model_id": critic["id"],
                "depends_on": [1, 2]
            })
            agent_configs["gpt_critic"] = critic
            
            judge = AGENTS["llama_judge"]
            steps.append({
                "step_number": 4,
                "agent_id": "llama_judge",
                "agent_name": judge["name"],
                "agent_role": judge["role"],
                "task": "final_verdict",
                "instruction": "Make final decision and synthesize best answer",
                "icon": judge["icon"],
                "color": judge["color"],
                "model_id": judge["id"],
                "depends_on": [1, 2, 3]
            })
            agent_configs["llama_judge"] = judge
        
        return {
            "workflow_name": "Fallback Dynamic Workflow",
            "strategy": "Progressive analysis based on complexity",
            "complexity_level": "simple" if complexity < 40 else ("moderate" if complexity < 70 else "complex"),
            "debate_enabled": complexity > 60,
            "debate_rounds": 1 if complexity > 60 else 0,
            "steps": steps,
            "agent_configs": agent_configs,
            "total_agents": len(agent_configs),
            "total_steps": len(steps),
            "fusion_strategy": "judge_picks" if complexity > 60 else "best_answer",
            "success_criteria": "Accurate, well-reasoned answer",
            "dynamically_generated": True,
            "is_fallback": True
        }
    
    async def should_self_correct(self, responses: List[Dict], confidence_scores: List[float]) -> Dict[str, Any]:
        """
        Determine if self-correction loop is needed
        Returns decision and reasoning
        """
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # Criteria for self-correction
        needs_correction = False
        reasons = []
        
        if avg_confidence < 70:
            needs_correction = True
            reasons.append(f"Low average confidence: {avg_confidence:.1f}%")
        
        # Check for conflicting responses
        if len(responses) > 1:
            # Simple conflict detection based on response length variance
            lengths = [len(r.get("content", "")) for r in responses]
            variance = max(lengths) - min(lengths)
            if variance > 500:  # Significant variance might indicate conflicting views
                needs_correction = True
                reasons.append("High variance in response lengths (possible conflicts)")
        
        return {
            "needs_correction": needs_correction,
            "average_confidence": avg_confidence,
            "reasons": reasons,
            "recommendation": "Re-run with deeper analysis" if needs_correction else "Proceed to final answer"
        }
    
    async def create_sub_agent(self, task_description: str, parent_agent: str) -> Dict[str, Any]:
        """
        Create a temporary specialized sub-agent for a specific task
        """
        prompt = f"""Create a specialized sub-agent configuration for this task:

TASK: {task_description}
PARENT AGENT: {parent_agent}

Respond with ONLY a JSON object:
{{
    "name": "SubAgent Name",
    "role": "Specific role for this task",
    "focus": "What this agent should focus on",
    "approach": "How it should approach the task",
    "temperature": <0.1-0.9>
}}"""
        
        response = await self.generate(prompt)
        
        try:
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```(?:json)?\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            sub_agent_config = json.loads(clean_response)
            sub_agent_config["parent"] = parent_agent
            sub_agent_config["is_sub_agent"] = True
            return sub_agent_config
        except:
            return {
                "name": f"{parent_agent} SubAgent",
                "role": "Task Specialist",
                "focus": task_description[:100],
                "approach": "Detailed analysis",
                "temperature": 0.5,
                "parent": parent_agent,
                "is_sub_agent": True
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get Master Controller status"""
        return {
            "name": self.name,
            "role": self.role,
            "icon": self.icon,
            "color": self.color,
            "capabilities": self.capabilities,
            "available_agents": list(AGENTS.keys()),
            "workflow_mode": "dynamic",
            "task_types": DYNAMIC_WORKFLOW_CONFIG["task_types"],
            "max_agents": DYNAMIC_WORKFLOW_CONFIG["max_agents_per_workflow"]
        }
