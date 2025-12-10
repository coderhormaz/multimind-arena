// Types for the Master Controller Multi-Agent AI System

// Agent Configuration
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description?: string;
  temperature: number;
  color: string;
  icon: string;
  capabilities: string[];
  speed?: 'fast' | 'moderate' | 'slow';
  depth?: 'shallow' | 'moderate' | 'deep';
}

// Master Controller
export interface MasterController {
  name: string;
  role: string;
  icon: string;
  color: string;
  capabilities: string[];
}

// Query Analysis
export interface QueryAnalysis {
  query_type: string;
  complexity_score: number;
  requires_debate: boolean;
  requires_deep_analysis: boolean;
  requires_coding: boolean;
  key_concepts: string[];
  recommended_agents: string[];
  estimated_rounds: number;
  reasoning: string;
}

// Workflow Step
export interface WorkflowStep {
  step_number: number;
  agent_id: string;
  agent_name: string;
  agent_role?: string;
  task: string;
  instruction?: string;
  icon: string;
  color: string;
  depends_on?: number[];
}

// Workflow Plan
export interface WorkflowPlan {
  workflow_name: string;
  strategy: string;
  complexity_level: 'simple' | 'moderate' | 'complex';
  debate_enabled: boolean;
  debate_rounds?: number;
  total_steps: number;
  steps: WorkflowStep[];
  agents: string[];
  fusion_strategy?: string;
}

// Agent Response
export interface AgentResponse {
  step_number?: number;
  agent_id: string;
  agent_name: string;
  role?: string;
  task: string;
  content: string;
  confidence: number;
  icon: string;
  color: string;
}

// SSE Event Types
export type SSEEventType =
  | 'master_start'
  | 'memory_context'
  | 'analysis_complete'
  | 'designing_workflow'
  | 'workflow_designed'
  | 'workflow_start'
  | 'agent_start'
  | 'agent_complete'
  | 'routing'
  | 'self_correction'
  | 'confidence_check'
  | 'workflow_complete'
  | 'synthesizing'
  | 'final_answer'
  | 'memory_stored'
  | 'complete'
  | 'error';

// SSE Event Data Types
export interface MasterStartEvent {
  type: 'master_start';
  message: string;
  icon: string;
  color: string;
  timestamp: string;
}

export interface AnalysisCompleteEvent {
  type: 'analysis_complete';
  analysis: QueryAnalysis;
  message: string;
}

export interface WorkflowDesignedEvent {
  type: 'workflow_designed';
  workflow: WorkflowPlan;
  message: string;
}

export interface AgentStartEvent {
  type: 'agent_start';
  step: number;
  agent_id: string;
  agent_name: string;
  task: string;
  instruction: string;
  icon: string;
  color: string;
  message: string;
}

export interface AgentCompleteEvent {
  type: 'agent_complete';
  step: number;
  agent_id: string;
  agent_name: string;
  task: string;
  content: string;
  confidence: number;
  icon: string;
  color: string;
}

export interface RoutingEvent {
  type: 'routing';
  from_agent: string;
  to_agent: string;
  from_step: number;
  to_step: number;
  message: string;
}

export interface SelfCorrectionEvent {
  type: 'self_correction';
  loop: number;
  reason: string;
  action: string;
  message: string;
}

export interface FinalAnswerEvent {
  type: 'final_answer';
  content: string;
  confidence: number;
  strategy: string;
  source_agent: string;
  evaluated_responses?: number;
}

export interface CompleteEvent {
  type: 'complete';
  total_time: number;
  total_steps: number;
  total_agents: number;
  correction_loops: number;
  final_confidence: number;
  workflow_name: string;
  message: string;
}

export interface ErrorEvent {
  type: 'error';
  error: string;
}

// Union of all events
export type SSEEventData =
  | MasterStartEvent
  | AnalysisCompleteEvent
  | WorkflowDesignedEvent
  | AgentStartEvent
  | AgentCompleteEvent
  | RoutingEvent
  | SelfCorrectionEvent
  | FinalAnswerEvent
  | CompleteEvent
  | ErrorEvent
  | { type: string; [key: string]: any };

// Interaction History
export interface Interaction {
  id: string;
  timestamp: string;
  query: string;
  workflow_name: string;
  workflow_strategy: string;
  complexity: string;
  agents_used: string[];
  response_count: number;
  final_confidence: number;
  final_answer_preview: string;
}

// Agent Metrics
export interface AgentMetrics {
  total_uses: number;
  total_confidence: number;
  average_confidence: number;
}

// System Status
export interface SystemStatus {
  master_controller: {
    name: string;
    role: string;
    icon: string;
    color: string;
    capabilities: string[];
    available_agents: string[];
    workflow_mode: string;
    task_types: string[];
  };
  memory: {
    total_interactions: number;
    total_facts: number;
    agents_tracked: number;
    short_term_items: number;
    agent_metrics: Record<string, AgentMetrics>;
  } | null;
  available_agents: string[];
}

// UI State
export interface UIState {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  workflow: WorkflowPlan | null;
  analysis: QueryAnalysis | null;
  responses: AgentResponse[];
  finalAnswer: FinalAnswerEvent | null;
  errors: string[];
  completionData: CompleteEvent | null;
}

// Stats (for StatsPanel)
export interface Stats {
  total_interactions: number;
  total_agents_used: number;
  average_confidence: number;
  average_processing_time: number;
  avg_processing_time: number; // alias for legacy components
  most_used_agent: string;
  complexity_distribution: {
    simple: number;
    moderate: number;
    complex: number;
  };
  agent_stats?: {
    agentA?: { avg_time: number; total_calls: number };
    agentB?: { avg_time: number; total_calls: number };
    referee?: { avg_time: number; total_calls: number };
  };
}

// Debate Stats (legacy support)
export interface DebateStats {
  total_debates: number;
  reasoner_a_wins: number;
  reasoner_b_wins: number;
  draws: number;
  average_rounds: number;
  average_confidence: number;
  avg_processing_time: number;
  win_rate_a: number;
  win_rate_b: number;
}

// Debate Interaction (legacy support)
export interface DebateInteraction {
  id: string;
  timestamp: string;
  question: string;
  winner: string;
  rounds: number;
  num_rounds: number; // alias for legacy
  final_confidence: number;
  processing_time: number;
  total_processing_time: number; // alias for legacy
}
