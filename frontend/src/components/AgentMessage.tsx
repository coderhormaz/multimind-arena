import { AgentResponse } from '@/types';
import ConfidenceBar from './ConfidenceBar';

interface Props {
  response: AgentResponse;
}

export default function AgentMessage({ response }: Props) {
  return (
    <div 
      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 animate-fadeIn"
      style={{ borderLeftColor: response.color, borderLeftWidth: '3px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{response.icon}</span>
          <div>
            <span className="font-medium text-white">{response.agent_name}</span>
            <span className="text-gray-500 text-sm ml-2">• {response.task}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {response.step_number && (
            <span className="text-xs text-gray-500">Step {response.step_number}</span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
        {response.content}
      </div>
      
      {/* Footer with confidence */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <ConfidenceBar confidence={response.confidence} size="sm" />
      </div>
    </div>
  );
}
