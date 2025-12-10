import { AgentResponse } from '@/types';
import ConfidenceBar from './ConfidenceBar';

interface Props {
  response: AgentResponse;
}

// Symbol mapping for agents
const AGENT_SYMBOLS: Record<string, string> = {
  'gemini': '◇',
  'deepseek': '◈',
  'qwen_coder': '⟨⟩',
  'gpt_critic': '◎',
  'llama_judge': '⚖',
  'gemma': '◆',
};

export default function AgentMessage({ response }: Props) {
  const symbol = AGENT_SYMBOLS[response.agent_id] || '○';
  
  return (
    <div className="bg-[#2f2f2f] rounded-xl p-4 border border-[#424242] animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${response.color}20` }}
        >
          <span style={{ color: response.color }}>{symbol}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-sm">{response.agent_name}</span>
              <span className="text-xs text-[#565656]">•</span>
              <span className="text-xs text-[#b4b4b4]">{response.task}</span>
            </div>
            {response.step_number && (
              <span className="text-xs text-[#565656]">Step {response.step_number}</span>
            )}
          </div>
          
          {/* Content */}
          <div className="text-[#ececec] text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-thin">
            {response.content}
          </div>
          
          {/* Footer with confidence */}
          <div className="mt-3 pt-3 border-t border-[#424242]">
            <ConfidenceBar confidence={response.confidence} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
