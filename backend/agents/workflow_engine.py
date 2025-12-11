"""
Workflow Engine
Executes dynamic workflows designed by the Master Controller
Handles agent routing, step execution, confidence tracking, and self-correction
"""
import asyncio
from typing import Dict, List, Any, AsyncGenerator, Optional
from .base import BaseAgent
from config import AGENTS, MAX_SELF_CORRECTION_LOOPS, MIN_CONFIDENCE_THRESHOLD


class SpecializedAgent(BaseAgent):
    """
    Dynamic specialized agent that adapts to any role
    Created on-the-fly based on workflow requirements
    """
    
    def __init__(self, agent_config: Dict[str, Any]):
        super().__init__(
            model_id=agent_config.get("id", agent_config.get("model_id")),
            name=agent_config.get("name", "Agent"),
            role=agent_config.get("role", "Assistant"),
            temperature=agent_config.get("temperature", 0.7)
        )
        self.icon = agent_config.get("icon", "🤖")
        self.color = agent_config.get("color", "#6B7280")
        self.capabilities = agent_config.get("capabilities", [])
        self.agent_id = agent_config.get("agent_id", "unknown")
    
    async def execute_task(self, task: str, instruction: str, query: str, 
                          context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a specific task with the given instruction
        """
        # Build context from previous steps
        context_str = ""
        if context and context.get("previous_responses"):
            context_str = "\n\nPREVIOUS AGENT RESPONSES:\n"
            for resp in context.get("previous_responses", []):
                context_str += f"\n--- {resp.get('agent_name', 'Agent')} ({resp.get('task', 'task')}) ---\n"
                context_str += f"{resp.get('content', '')[:1500]}\n"
        
        prompt = f"""You are {self.name}, a {self.role}.

YOUR TASK: {task}
SPECIFIC INSTRUCTION: {instruction}

USER'S ORIGINAL QUERY: "{query}"
{context_str}

Provide your response. Be thorough, accurate, and helpful.
At the end, rate your confidence in your answer from 0-100.

Format your response as:
[Your detailed response here]

CONFIDENCE: [0-100]"""

        response = await self.generate(prompt)
        
        # Extract confidence score
        confidence = self._extract_confidence(response)
        
        # Clean response (remove confidence line if present)
        clean_response = response
        if "CONFIDENCE:" in response:
            parts = response.rsplit("CONFIDENCE:", 1)
            clean_response = parts[0].strip()
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "role": self.role,
            "task": task,
            "instruction": instruction,
            "content": clean_response,
            "confidence": confidence,
            "icon": self.icon,
            "color": self.color
        }
    
    def _extract_confidence(self, response: str) -> int:
        """Extract confidence score from response"""
        import re
        
        # Try to find CONFIDENCE: pattern
        match = re.search(r'CONFIDENCE:\s*(\d+)', response, re.IGNORECASE)
        if match:
            return min(100, max(0, int(match.group(1))))
        
        # Fallback: estimate based on response characteristics
        if len(response) > 500:
            return 75
        elif len(response) > 200:
            return 65
        else:
            return 55


class WorkflowEngine:
    """
    Executes dynamic workflows step by step
    Handles parallel execution, dependencies, and self-correction
    """
    
    def __init__(self):
        self.agents: Dict[str, SpecializedAgent] = {}
        self.execution_history: List[Dict] = []
        self.confidence_scores: List[float] = []
    
    def _get_or_create_agent(self, agent_id: str, agent_config: Dict) -> SpecializedAgent:
        """Get existing agent or create new one"""
        if agent_id not in self.agents:
            config = {**agent_config, "agent_id": agent_id}
            self.agents[agent_id] = SpecializedAgent(config)
        return self.agents[agent_id]
    
    async def execute_workflow(self, workflow: Dict[str, Any], query: str) -> AsyncGenerator[Dict, None]:
        """
        Execute a dynamic workflow and yield events for each step
        """
        self.execution_history = []
        self.confidence_scores = []
        
        steps = workflow.get("steps", [])
        agent_configs = workflow.get("agent_configs", {})
        
        yield {
            "type": "workflow_start",
            "workflow_name": workflow.get("workflow_name", "Dynamic Workflow"),
            "strategy": workflow.get("strategy", ""),
            "total_steps": len(steps),
            "complexity": workflow.get("complexity_level", "moderate"),
            "debate_enabled": workflow.get("debate_enabled", False)
        }
        
        # Execute steps
        for step in steps:
            step_num = step.get("step_number", 0)
            agent_id = step.get("agent_id")
            
            # Check dependencies
            depends_on = step.get("depends_on", [])
            if depends_on:
                # Wait for dependencies (they should already be done in sequential order)
                pass
            
            # Get agent config
            agent_config = agent_configs.get(agent_id, AGENTS.get(agent_id, {}))
            if not agent_config:
                continue
            
            # Create/get agent
            agent = self._get_or_create_agent(agent_id, agent_config)
            
            # Emit start event
            yield {
                "type": "agent_start",
                "step_number": step_num,
                "agent_id": agent_id,
                "agent_name": step.get("agent_name", agent.name),
                "task": step.get("task", "process"),
                "instruction": step.get("instruction", ""),
                "icon": step.get("icon", agent.icon),
                "color": step.get("color", agent.color)
            }
            
            # Build context from previous responses
            context = {
                "previous_responses": self.execution_history,
                "workflow": workflow,
                "step": step
            }
            
            # Execute task
            result = await agent.execute_task(
                task=step.get("task", "analyze"),
                instruction=step.get("instruction", f"Process: {query}"),
                query=query,
                context=context
            )
            
            # Store result
            result["step_number"] = step_num
            self.execution_history.append(result)
            self.confidence_scores.append(result.get("confidence", 70))
            
            # Emit completion event
            yield {
                "type": "agent_complete",
                "step_number": step_num,
                "agent_id": agent_id,
                "agent_name": result.get("agent_name"),
                "task": result.get("task"),
                "content": result.get("content"),
                "confidence": result.get("confidence"),
                "icon": result.get("icon"),
                "color": result.get("color")
            }
            
            # Emit routing event if there's a next step
            if step_num < len(steps):
                next_step = steps[step_num] if step_num < len(steps) else None
                if next_step:
                    yield {
                        "type": "routing",
                        "from_agent": agent_id,
                        "to_agent": next_step.get("agent_id"),
                        "from_step": step_num,
                        "to_step": step_num + 1
                    }
        
        # Calculate overall confidence
        avg_confidence = sum(self.confidence_scores) / len(self.confidence_scores) if self.confidence_scores else 0
        
        yield {
            "type": "workflow_complete",
            "total_steps_executed": len(self.execution_history),
            "average_confidence": avg_confidence,
            "all_responses": self.execution_history,
            "fusion_strategy": workflow.get("fusion_strategy", "best_answer")
        }
    
    async def execute_with_self_correction(self, workflow: Dict[str, Any], query: str,
                                           master_controller) -> AsyncGenerator[Dict, None]:
        """
        Execute workflow with self-correction loops if confidence is low
        """
        correction_loop = 0
        final_result = None
        
        while correction_loop <= MAX_SELF_CORRECTION_LOOPS:
            # Execute workflow
            async for event in self.execute_workflow(workflow, query):
                yield event
                
                if event.get("type") == "workflow_complete":
                    final_result = event
            
            if not final_result:
                break
            
            avg_confidence = final_result.get("average_confidence", 0)
            
            # Check if we need self-correction
            if avg_confidence >= MIN_CONFIDENCE_THRESHOLD:
                yield {
                    "type": "confidence_check",
                    "passed": True,
                    "confidence": avg_confidence,
                    "threshold": MIN_CONFIDENCE_THRESHOLD,
                    "message": f"Confidence {avg_confidence:.1f}% meets threshold"
                }
                break
            
            correction_loop += 1
            
            if correction_loop <= MAX_SELF_CORRECTION_LOOPS:
                yield {
                    "type": "self_correction",
                    "loop": correction_loop,
                    "reason": f"Low confidence ({avg_confidence:.1f}% < {MIN_CONFIDENCE_THRESHOLD}%)",
                    "action": "Re-analyzing with deeper scrutiny"
                }
                
                # Get master controller to redesign workflow with deeper analysis
                correction_analysis = await master_controller.should_self_correct(
                    self.execution_history, 
                    self.confidence_scores
                )
                
                yield {
                    "type": "correction_analysis",
                    "analysis": correction_analysis
                }
                
                # Modify workflow for deeper analysis
                workflow = self._enhance_workflow_for_correction(workflow, correction_loop)
            else:
                yield {
                    "type": "max_corrections_reached",
                    "loops": correction_loop - 1,
                    "final_confidence": avg_confidence,
                    "message": "Maximum correction loops reached, proceeding with best result"
                }
        
        # Yield final synthesis
        yield {
            "type": "ready_for_synthesis",
            "responses": self.execution_history,
            "confidence_scores": self.confidence_scores,
            "correction_loops": correction_loop
        }
    
    def _enhance_workflow_for_correction(self, workflow: Dict, loop: int) -> Dict:
        """Enhance workflow for self-correction iteration"""
        enhanced = workflow.copy()
        enhanced["steps"] = workflow.get("steps", []).copy()
        
        # Add extra scrutiny instruction to all steps
        for step in enhanced["steps"]:
            original_instruction = step.get("instruction", "")
            step["instruction"] = f"{original_instruction} [CORRECTION LOOP {loop}: Be extra thorough, question assumptions, verify facts]"
        
        # Add additional critic pass if not already present
        if not any(s.get("task") == "deep_critique" for s in enhanced["steps"]):
            critic_config = AGENTS.get("gpt_critic", {})
            if critic_config:
                enhanced["steps"].append({
                    "step_number": len(enhanced["steps"]) + 1,
                    "agent_id": "gpt_critic",
                    "agent_name": critic_config.get("name", "GPT Critic"),
                    "agent_role": critic_config.get("role", "Error Detector"),
                    "task": "deep_critique",
                    "instruction": "Perform deep critique. Find any errors, inconsistencies, or gaps. Be very thorough.",
                    "icon": critic_config.get("icon", "🔍"),
                    "color": critic_config.get("color", "#EF4444"),
                    "depends_on": list(range(1, len(enhanced["steps"]) + 1))
                })
        
        return enhanced
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of workflow execution"""
        return {
            "total_steps": len(self.execution_history),
            "agents_used": list(set(r.get("agent_id") for r in self.execution_history)),
            "average_confidence": sum(self.confidence_scores) / len(self.confidence_scores) if self.confidence_scores else 0,
            "min_confidence": min(self.confidence_scores) if self.confidence_scores else 0,
            "max_confidence": max(self.confidence_scores) if self.confidence_scores else 0,
            "responses": self.execution_history
        }


class AnswerSynthesizer:
    """
    Synthesizes final answer from multiple agent responses
    Based on the fusion strategy from the workflow
    """
    
    def __init__(self):
        self.judge_agent = None
    
    def _get_judge(self) -> SpecializedAgent:
        """Get or create judge agent"""
        if not self.judge_agent:
            judge_config = AGENTS.get("llama_judge", {})
            self.judge_agent = SpecializedAgent({
                **judge_config,
                "agent_id": "llama_judge"
            })
        return self.judge_agent
    
    async def synthesize(self, responses: List[Dict], workflow: Dict, query: str) -> Dict[str, Any]:
        """
        Synthesize final answer based on fusion strategy
        """
        fusion_strategy = workflow.get("fusion_strategy", "judge_picks")
        
        if fusion_strategy == "code_direct":
            # For coding: return the coder's response directly without modification
            return self._return_code_direct(responses)
        elif fusion_strategy == "best_answer":
            return self._pick_best_by_confidence(responses)
        elif fusion_strategy == "synthesis":
            return await self._synthesize_all(responses, query)
        elif fusion_strategy == "weighted_average":
            return await self._weighted_synthesis(responses, query)
        else:  # judge_picks
            return await self._judge_picks(responses, query)
    
    def _return_code_direct(self, responses: List[Dict]) -> Dict[str, Any]:
        """Return the coder's response directly without any modification"""
        if not responses:
            return {"content": "No code generated", "confidence": 0}
        
        # Get the Qwen Coder response (should be first/only for coding tasks)
        coder_response = responses[0]
        for r in responses:
            if r.get("agent_id") == "qwen_coder":
                coder_response = r
                break
        
        return {
            "type": "final_answer",
            "strategy": "code_direct",
            "content": coder_response.get("content", ""),
            "confidence": coder_response.get("confidence", 85),
            "source_agent": coder_response.get("agent_name", "Qwen Coder"),
            "source_agent_id": coder_response.get("agent_id", "qwen_coder")
        }
    
    def _pick_best_by_confidence(self, responses: List[Dict]) -> Dict[str, Any]:
        """Pick the response with highest confidence"""
        if not responses:
            return {"content": "No responses available", "confidence": 0}
        
        best = max(responses, key=lambda r: r.get("confidence", 0))
        return {
            "type": "final_answer",
            "strategy": "best_answer",
            "content": best.get("content", ""),
            "confidence": best.get("confidence", 0),
            "source_agent": best.get("agent_name", "Unknown"),
            "source_agent_id": best.get("agent_id", "unknown")
        }
    
    async def _synthesize_all(self, responses: List[Dict], query: str) -> Dict[str, Any]:
        """Synthesize all responses into one coherent answer"""
        judge = self._get_judge()
        
        responses_text = "\n\n".join([
            f"--- {r.get('agent_name')} (Confidence: {r.get('confidence', 0)}%) ---\n{r.get('content', '')}"
            for r in responses
        ])
        
        prompt = f"""Synthesize these multiple agent responses into one comprehensive, coherent answer.

ORIGINAL QUERY: "{query}"

AGENT RESPONSES:
{responses_text}

Create a single, well-structured answer that:
1. Combines the best insights from all responses
2. Resolves any contradictions
3. Presents a clear, actionable conclusion

Your synthesized answer:"""
        
        content = await judge.generate(prompt)
        
        avg_confidence = sum(r.get("confidence", 0) for r in responses) / len(responses) if responses else 0
        
        return {
            "type": "final_answer",
            "strategy": "synthesis",
            "content": content,
            "confidence": avg_confidence,
            "source_agent": "Llama Judge (Synthesis)",
            "source_agent_id": "llama_judge",
            "contributing_agents": [r.get("agent_id") for r in responses]
        }
    
    async def _weighted_synthesis(self, responses: List[Dict], query: str) -> Dict[str, Any]:
        """Weight responses by confidence and synthesize"""
        # Similar to synthesis but explicitly weights by confidence
        return await self._synthesize_all(responses, query)
    
    async def _judge_picks(self, responses: List[Dict], query: str) -> Dict[str, Any]:
        """Have the judge evaluate and pick/combine the best answer"""
        judge = self._get_judge()
        
        responses_text = "\n\n".join([
            f"--- RESPONSE {i+1}: {r.get('agent_name')} ({r.get('role')}) [Confidence: {r.get('confidence', 0)}%] ---\n{r.get('content', '')}"
            for i, r in enumerate(responses)
        ])
        
        prompt = f"""You are the Final Judge. Evaluate all agent responses and provide the definitive answer.

ORIGINAL QUERY: "{query}"

AGENT RESPONSES TO EVALUATE:
{responses_text}

Your task:
1. Evaluate each response for accuracy, completeness, and reasoning quality
2. Score each response (0-100)
3. Either pick the best response OR synthesize a superior answer
4. Provide your final verdict

Format your response:
## Evaluation
[Brief evaluation of each response]

## Scores
- Response 1: [score]/100
- Response 2: [score]/100
...

## Winner
[Which response wins OR "Synthesis"]

## Final Answer
[The definitive answer to the user's query]

## Overall Confidence
[0-100]%"""
        
        content = await judge.generate(prompt)
        
        # Extract confidence
        import re
        confidence_match = re.search(r'Overall Confidence[:\s]*(\d+)', content, re.IGNORECASE)
        confidence = int(confidence_match.group(1)) if confidence_match else 80
        
        return {
            "type": "final_answer",
            "strategy": "judge_picks",
            "content": content,
            "confidence": confidence,
            "source_agent": "Llama Judge",
            "source_agent_id": "llama_judge",
            "evaluated_responses": len(responses)
        }
