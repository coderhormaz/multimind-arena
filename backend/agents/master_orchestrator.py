"""
Master Orchestrator
The main entry point that coordinates Master Controller, Workflow Engine, and Memory
Provides SSE streaming for real-time UI updates
"""
import json
from typing import Dict, Any, AsyncGenerator
from datetime import datetime

from .master_controller import MasterController
from .workflow_engine import WorkflowEngine, AnswerSynthesizer
from .memory_engine import MemoryEngine
from config import MEMORY_ENABLED


class MasterOrchestrator:
    """
    Main orchestrator that:
    1. Receives user queries
    2. Uses Master Controller to analyze and design workflow
    3. Executes workflow with Workflow Engine
    4. Handles self-correction loops
    5. Synthesizes final answer
    6. Stores in memory
    7. Streams all events via SSE
    """
    
    def __init__(self):
        self.master_controller = MasterController()
        self.workflow_engine = WorkflowEngine()
        self.synthesizer = AnswerSynthesizer()
        self.memory = MemoryEngine() if MEMORY_ENABLED else None
    
    async def process_query(self, query: str) -> AsyncGenerator[Dict, None]:
        """
        Process a user query through the entire pipeline
        Yields SSE events for each step
        """
        start_time = datetime.now()
        
        # Phase 1: Master Controller Analysis
        yield {
            "event": "master_start",
            "data": {
                "type": "master_start",
                "message": "Master Controller analyzing query...",
                "icon": self.master_controller.icon,
                "color": self.master_controller.color,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        # Get memory context if enabled
        memory_context = ""
        if self.memory:
            memory_context = self.memory.build_context_prompt(query)
            if memory_context:
                yield {
                    "event": "memory_context",
                    "data": {
                        "type": "memory_context",
                        "message": "Retrieved relevant context from memory",
                        "context": memory_context
                    }
                }
        
        # Analyze query
        analysis = await self.master_controller.analyze_query(query)
        
        yield {
            "event": "analysis_complete",
            "data": {
                "type": "analysis_complete",
                "analysis": analysis,
                "message": f"Query type: {analysis.get('query_type', 'general')} | Complexity: {analysis.get('complexity_score', 50)}/100"
            }
        }
        
        # Phase 2: Dynamic Workflow Design
        yield {
            "event": "designing_workflow",
            "data": {
                "type": "designing_workflow",
                "message": "Master Controller designing optimal workflow..."
            }
        }
        
        workflow = await self.master_controller.create_workflow_plan(query, analysis)
        
        yield {
            "event": "workflow_designed",
            "data": {
                "type": "workflow_designed",
                "workflow": {
                    "name": workflow.get("workflow_name", "Dynamic Workflow"),
                    "strategy": workflow.get("strategy", ""),
                    "complexity": workflow.get("complexity_level", "moderate"),
                    "total_steps": workflow.get("total_steps", 0),
                    "agents": [s.get("agent_id") for s in workflow.get("steps", [])],
                    "debate_enabled": workflow.get("debate_enabled", False),
                    "steps": [
                        {
                            "step": s.get("step_number"),
                            "agent": s.get("agent_id"),
                            "name": s.get("agent_name"),
                            "task": s.get("task"),
                            "icon": s.get("icon"),
                            "color": s.get("color")
                        }
                        for s in workflow.get("steps", [])
                    ]
                },
                "message": f"Workflow '{workflow.get('workflow_name')}' designed with {len(workflow.get('steps', []))} steps"
            }
        }
        
        # Phase 3: Execute Workflow with Self-Correction
        all_responses = []
        all_confidences = []
        correction_loops = 0
        
        async for event in self.workflow_engine.execute_with_self_correction(
            workflow, query, self.master_controller
        ):
            event_type = event.get("type", "unknown")
            
            # Transform workflow engine events to SSE format
            if event_type == "workflow_start":
                yield {
                    "event": "workflow_start",
                    "data": {
                        "type": "workflow_start",
                        **event
                    }
                }
            
            elif event_type == "agent_start":
                yield {
                    "event": "agent_start",
                    "data": {
                        "type": "agent_start",
                        "step": event.get("step_number"),
                        "agent_id": event.get("agent_id"),
                        "agent_name": event.get("agent_name"),
                        "task": event.get("task"),
                        "instruction": event.get("instruction"),
                        "icon": event.get("icon"),
                        "color": event.get("color"),
                        "message": f"{event.get('agent_name')} starting: {event.get('task')}"
                    }
                }
            
            elif event_type == "agent_complete":
                all_responses.append(event)
                all_confidences.append(event.get("confidence", 0))
                
                yield {
                    "event": "agent_complete",
                    "data": {
                        "type": "agent_complete",
                        "step": event.get("step_number"),
                        "agent_id": event.get("agent_id"),
                        "agent_name": event.get("agent_name"),
                        "task": event.get("task"),
                        "content": event.get("content"),
                        "confidence": event.get("confidence"),
                        "icon": event.get("icon"),
                        "color": event.get("color")
                    }
                }
            
            elif event_type == "routing":
                yield {
                    "event": "routing",
                    "data": {
                        "type": "routing",
                        "from_agent": event.get("from_agent"),
                        "to_agent": event.get("to_agent"),
                        "from_step": event.get("from_step"),
                        "to_step": event.get("to_step"),
                        "message": f"Routing from {event.get('from_agent')} to {event.get('to_agent')}"
                    }
                }
            
            elif event_type == "self_correction":
                correction_loops = event.get("loop", 0)
                yield {
                    "event": "self_correction",
                    "data": {
                        "type": "self_correction",
                        "loop": correction_loops,
                        "reason": event.get("reason"),
                        "action": event.get("action"),
                        "message": f"Self-correction loop {correction_loops}: {event.get('reason')}"
                    }
                }
            
            elif event_type == "confidence_check":
                yield {
                    "event": "confidence_check",
                    "data": {
                        "type": "confidence_check",
                        "passed": event.get("passed"),
                        "confidence": event.get("confidence"),
                        "threshold": event.get("threshold"),
                        "message": event.get("message")
                    }
                }
            
            elif event_type == "workflow_complete":
                yield {
                    "event": "workflow_complete",
                    "data": {
                        "type": "workflow_complete",
                        "total_steps": event.get("total_steps_executed"),
                        "average_confidence": event.get("average_confidence"),
                        "message": f"Workflow complete. Average confidence: {event.get('average_confidence', 0):.1f}%"
                    }
                }
            
            elif event_type == "ready_for_synthesis":
                # Received all responses, ready to synthesize
                pass
        
        # Phase 4: Synthesize Final Answer
        yield {
            "event": "synthesizing",
            "data": {
                "type": "synthesizing",
                "message": "Synthesizing final answer...",
                "strategy": workflow.get("fusion_strategy", "judge_picks")
            }
        }
        
        # Get the responses from workflow engine
        execution_summary = self.workflow_engine.get_execution_summary()
        final_responses = execution_summary.get("responses", all_responses)
        
        # Synthesize final answer
        final_answer = await self.synthesizer.synthesize(
            final_responses, 
            workflow, 
            query
        )
        
        # Phase 5: Final Answer
        yield {
            "event": "final_answer",
            "data": {
                "type": "final_answer",
                "content": final_answer.get("content", ""),
                "confidence": final_answer.get("confidence", 0),
                "strategy": final_answer.get("strategy", ""),
                "source_agent": final_answer.get("source_agent", ""),
                "evaluated_responses": final_answer.get("evaluated_responses", len(final_responses))
            }
        }
        
        # Phase 6: Store in Memory
        if self.memory:
            interaction_id = await self.memory.store_interaction(
                query=query,
                workflow=workflow,
                responses=final_responses,
                final_answer=final_answer,
                metadata={
                    "correction_loops": correction_loops,
                    "total_time": (datetime.now() - start_time).total_seconds()
                }
            )
            
            yield {
                "event": "memory_stored",
                "data": {
                    "type": "memory_stored",
                    "interaction_id": interaction_id,
                    "message": "Interaction stored in memory"
                }
            }
        
        # Phase 7: Complete
        total_time = (datetime.now() - start_time).total_seconds()
        
        yield {
            "event": "complete",
            "data": {
                "type": "complete",
                "total_time": total_time,
                "total_steps": len(final_responses),
                "total_agents": len(set(r.get("agent_id") for r in final_responses)),
                "correction_loops": correction_loops,
                "final_confidence": final_answer.get("confidence", 0),
                "workflow_name": workflow.get("workflow_name", ""),
                "message": f"Complete in {total_time:.1f}s | Confidence: {final_answer.get('confidence', 0)}%"
            }
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status"""
        return {
            "master_controller": self.master_controller.get_status(),
            "memory": self.memory.get_stats() if self.memory else None,
            "available_agents": list(self.workflow_engine.agents.keys())
        }
    
    def get_history(self, limit: int = 20) -> list:
        """Get interaction history"""
        if self.memory:
            return self.memory.get_interaction_history(limit)
        return []
    
    def get_agent_stats(self) -> Dict[str, Any]:
        """Get agent performance statistics"""
        if self.memory:
            return self.memory.get_agent_metrics()
        return {}
