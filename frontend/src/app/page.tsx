'use client';

import { useState, useRef, useEffect } from 'react';

// Agent model mapping for display
const AGENT_MODELS: Record<string, { model: string; icon: string; color: string; role: string }> = {
  'gemini': { model: 'google/gemini-2.0-flash-exp:free', icon: '⚡', color: '#10B981', role: 'Fast Reasoner' },
  'deepseek': { model: 'tngtech/deepseek-r1t-chimera:free', icon: '🔬', color: '#3B82F6', role: 'Deep Analyzer' },
  'qwen_coder': { model: 'qwen/qwen3-coder:free', icon: '💻', color: '#F59E0B', role: 'Code Specialist' },
  'gpt_critic': { model: 'openai/gpt-oss-20b:free', icon: '🔍', color: '#EF4444', role: 'Error Detector' },
  'llama_judge': { model: 'meta-llama/llama-3.3-70b-instruct:free', icon: '⚖️', color: '#6366F1', role: 'Final Arbiter' },
  'gemma': { model: 'google/gemma-3-27b-it:free', icon: '💎', color: '#EC4899', role: 'Balanced Reasoner' },
};

interface QueryAnalysis {
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

interface WorkflowStep {
  step: number;
  agent: string;
  name: string;
  task: string;
  icon: string;
  color: string;
}

interface WorkflowPlan {
  name: string;
  strategy: string;
  complexity: string;
  total_steps: number;
  agents: string[];
  debate_enabled: boolean;
  steps: WorkflowStep[];
}

interface AgentResponse {
  step_number: number;
  agent_id: string;
  agent_name: string;
  task: string;
  content: string;
  confidence: number;
  icon: string;
  color: string;
}

interface FinalAnswerData {
  content: string;
  confidence: number;
  strategy: string;
  source_agent: string;
  evaluated_responses?: number;
}

interface CompletionData {
  total_time: number;
  total_steps: number;
  total_agents: number;
  correction_loops: number;
  final_confidence: number;
  workflow_name: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('idle');
  const [phaseMessage, setPhaseMessage] = useState<string>('');
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowPlan | null>(null);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [activeAgent, setActiveAgent] = useState<{id: string; name: string; task: string} | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswerData | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfCorrections, setSelfCorrections] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [responses, finalAnswer, activeAgent]);

  useEffect(() => {
    if (isProcessing) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentPhase('starting');
    setPhaseMessage('🚀 Initializing Master Controller...');
    setAnalysis(null);
    setWorkflow(null);
    setResponses([]);
    setActiveAgent(null);
    setFinalAnswer(null);
    setCompletionData(null);
    setError(null);
    setSelfCorrections(0);

    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) throw new Error('Failed to start query');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('complete');
      setActiveAgent(null);
    }
  };

  const handleSSEEvent = (data: any) => {
    switch (data.type) {
      case 'master_start':
        setCurrentPhase('analyzing');
        setPhaseMessage('🧠 Master Controller analyzing your query...');
        break;
      
      case 'analysis_complete':
        setAnalysis(data.analysis);
        setCurrentPhase('designing');
        setPhaseMessage('📋 Designing optimal workflow...');
        break;
      
      case 'workflow_designed':
        setWorkflow(data.workflow);
        setCurrentPhase('executing');
        setPhaseMessage('⚡ Starting workflow execution...');
        break;
      
      case 'agent_start':
        setActiveAgent({
          id: data.agent_id,
          name: data.agent_name,
          task: data.task
        });
        setPhaseMessage(`${data.icon || '🤖'} ${data.agent_name} is working on: ${data.task}`);
        break;
      
      case 'agent_waiting':
        // Show waiting status when agent is rate limited
        setPhaseMessage(`⏳ ${data.agent_name || 'Agent'} waiting for API (${data.wait_time || ''}s)... Free tier rate limit`);
        break;
      
      case 'agent_retry':
        // Show retry status
        setPhaseMessage(`🔄 ${data.agent_name || 'Agent'} retrying (attempt ${data.attempt || '?'})...`);
        break;
      
      case 'agent_complete':
        setResponses(prev => [...prev, {
          step_number: data.step,
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          task: data.task,
          content: data.content,
          confidence: data.confidence,
          icon: data.icon,
          color: data.color,
        }]);
        setActiveAgent(null);
        break;
      
      case 'routing':
        setPhaseMessage(`🔄 Routing: ${data.from_agent} → ${data.to_agent}`);
        break;
      
      case 'self_correction':
        setSelfCorrections(prev => prev + 1);
        setCurrentPhase('self_correcting');
        setPhaseMessage(`🔄 Self-correction loop ${data.loop}: ${data.reason}`);
        break;
      
      case 'synthesizing':
        setCurrentPhase('synthesizing');
        setPhaseMessage('✨ Synthesizing final answer from all responses...');
        break;
      
      case 'final_answer':
        setFinalAnswer({
          content: data.content,
          confidence: data.confidence,
          strategy: data.strategy,
          source_agent: data.source_agent,
          evaluated_responses: data.evaluated_responses
        });
        setCurrentPhase('complete');
        setPhaseMessage('✅ Complete!');
        break;
      
      case 'complete':
        setCompletionData({
          total_time: data.total_time,
          total_steps: data.total_steps,
          total_agents: data.total_agents,
          correction_loops: data.correction_loops,
          final_confidence: data.final_confidence,
          workflow_name: data.workflow_name
        });
        break;
      
      case 'error':
        setError(data.error);
        break;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-orange-400';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Master Controller AI
                </h1>
                <p className="text-xs text-gray-400">6 Specialized Agents • Dynamic Workflows</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-300">{elapsedTime.toFixed(1)}s</span>
                </div>
              )}
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                ● Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Available Models Banner */}
      <div className="bg-gray-800/30 border-b border-gray-700/50 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-gray-500 mb-2">🤖 Available AI Models:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AGENT_MODELS).map(([id, info]) => (
              <div 
                key={id} 
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-colors"
              >
                <span className="text-lg">{info.icon}</span>
                <div>
                  <p className="text-xs text-white font-medium">{info.role}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{info.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Query Input */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  💬 Ask anything...
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Explain quantum computing, Write a sorting algorithm..."
                  className="w-full h-28 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none text-sm"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>🚀 Submit Query</>
                  )}
                </button>
              </form>
            </div>

            {/* Live Status */}
            {currentPhase !== 'idle' && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">📡 Live Status</h3>
                  {isProcessing && (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                </div>
                <p className="text-white text-sm font-medium">{phaseMessage}</p>
                
                {activeAgent && (
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-purple-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-purple-300 font-medium">{activeAgent.name}</p>
                        <p className="text-purple-400/70 text-xs">{activeAgent.task}</p>
                        {AGENT_MODELS[activeAgent.id] && (
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {AGENT_MODELS[activeAgent.id].model}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selfCorrections > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">🔄 Self-corrections: {selfCorrections}</p>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Card */}
            {analysis && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/30">
                <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                  📊 Query Analysis
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Type</span>
                    <span className="text-white text-sm capitalize px-2 py-0.5 bg-blue-500/20 rounded">{analysis.query_type}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-xs">Complexity</span>
                      <span className="text-white text-sm">{analysis.complexity_score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          analysis.complexity_score > 70 ? 'bg-red-500' :
                          analysis.complexity_score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${analysis.complexity_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {analysis.requires_debate && (
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">⚔️ Debate</span>
                    )}
                    {analysis.requires_deep_analysis && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">🔬 Deep</span>
                    )}
                    {analysis.requires_coding && (
                      <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">💻 Code</span>
                    )}
                  </div>

                  {analysis.recommended_agents.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-xs">Selected Agents</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.recommended_agents.map((agentId, i) => {
                          const agent = AGENT_MODELS[agentId];
                          return agent ? (
                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded flex items-center gap-1">
                              {agent.icon} {agent.role}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Stats */}
            {completionData && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/30">
                <h3 className="text-sm font-medium text-green-400 mb-3">✅ Completion Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className="text-xl font-bold text-white">{completionData.total_time.toFixed(1)}s</p>
                    <p className="text-xs text-gray-400">Time</p>
                  </div>
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className="text-xl font-bold text-white">{completionData.total_steps}</p>
                    <p className="text-xs text-gray-400">Steps</p>
                  </div>
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className="text-xl font-bold text-white">{completionData.total_agents}</p>
                    <p className="text-xs text-gray-400">Agents</p>
                  </div>
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className={`text-xl font-bold ${getConfidenceColor(completionData.final_confidence)}`}>
                      {completionData.final_confidence}%
                    </p>
                    <p className="text-xs text-gray-400">Confidence</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Workflow Visualization */}
            {workflow && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      📋 {workflow.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">{workflow.strategy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      workflow.complexity === 'simple' ? 'bg-green-500/20 text-green-400' :
                      workflow.complexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {workflow.complexity}
                    </span>
                    {workflow.debate_enabled && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">⚔️ Debate</span>
                    )}
                  </div>
                </div>

                {/* Pipeline Steps */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {workflow.steps.map((step, index) => {
                    const isActive = activeAgent?.id === step.agent;
                    const isComplete = responses.some(r => r.step_number === step.step);
                    const agentInfo = AGENT_MODELS[step.agent];
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div 
                          className={`relative p-3 rounded-lg border transition-all min-w-[140px] ${
                            isActive 
                              ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20' 
                              : isComplete 
                                ? 'border-green-500/50 bg-green-500/10' 
                                : 'border-gray-700 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{step.icon}</span>
                            <span className={`text-sm font-medium ${isActive ? 'text-purple-300' : isComplete ? 'text-green-300' : 'text-gray-300'}`}>
                              {step.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{step.task}</p>
                          {agentInfo && (
                            <p className="text-[10px] text-gray-600 font-mono mt-1 truncate">
                              {agentInfo.model}
                            </p>
                          )}
                          {isComplete && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">✓</span>
                          )}
                          {isActive && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                            </span>
                          )}
                        </div>
                        {index < workflow.steps.length - 1 && (
                          <svg className="w-6 h-6 text-gray-600 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{responses.length} / {workflow.steps.length} steps</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${(responses.length / workflow.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Agent Responses */}
            <div className="bg-gray-800/50 rounded-xl border border-purple-500/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-medium text-white">🤖 Agent Responses</h3>
                {responses.length > 0 && (
                  <span className="text-sm text-gray-400">{responses.length} response{responses.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                {responses.length === 0 && !isProcessing && (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-5xl mb-4 block">🤖</span>
                    <p className="text-lg">Agent responses will appear here</p>
                    <p className="text-sm mt-1">Submit a query to get started</p>
                  </div>
                )}
                
                {responses.map((response, index) => {
                  const agentInfo = AGENT_MODELS[response.agent_id];
                  return (
                    <div 
                      key={index} 
                      className="bg-gray-900/50 rounded-lg p-4 border-l-4"
                      style={{ borderLeftColor: response.color || agentInfo?.color || '#6B7280' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{response.icon || agentInfo?.icon || '🤖'}</span>
                          <div>
                            <p className="font-medium text-white">{response.agent_name}</p>
                            <p className="text-xs text-gray-400">{response.task}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${getConfidenceColor(response.confidence)}`}>
                            {response.confidence}%
                          </span>
                          <p className="text-xs text-gray-500">Step {response.step_number}</p>
                        </div>
                      </div>
                      
                      {agentInfo && (
                        <p className="text-[10px] text-gray-500 font-mono mb-2 px-2 py-1 bg-gray-800 rounded inline-block">
                          {agentInfo.model}
                        </p>
                      )}
                      
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {response.content.length > 800 ? response.content.substring(0, 800) + '...' : response.content}
                      </div>
                      
                      <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${getConfidenceBarColor(response.confidence)}`} style={{ width: `${response.confidence}%` }} />
                      </div>
                    </div>
                  );
                })}
                
                {activeAgent && (
                  <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-purple-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium">{activeAgent.name} is thinking...</p>
                      <p className="text-purple-400/70 text-sm">{activeAgent.task}</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Final Answer */}
            {finalAnswer && (
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">✅</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Final Answer</h3>
                      <p className="text-sm text-gray-400">by {finalAnswer.source_agent} • {finalAnswer.strategy}</p>
                    </div>
                  </div>
                  {finalAnswer.evaluated_responses && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {finalAnswer.evaluated_responses} evaluated
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{finalAnswer.content}</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Confidence</span>
                    <span className={`font-medium ${getConfidenceColor(finalAnswer.confidence)}`}>{finalAnswer.confidence}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${getConfidenceBarColor(finalAnswer.confidence)}`} style={{ width: `${finalAnswer.confidence}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <span className="text-xl">❌</span>
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
