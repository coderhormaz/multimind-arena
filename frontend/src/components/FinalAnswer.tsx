'use client';

import { FinalAnswerEvent } from '@/types';

interface Props {
  answer: FinalAnswerEvent;
}

export default function FinalAnswer({ answer }: Props) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-[#10a37f]';
    if (score >= 60) return 'bg-[#f59e0b]';
    return 'bg-[#ef4444]';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 80) return 'text-[#10a37f]';
    if (score >= 60) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  return (
    <div className="bg-gradient-to-br from-[#10a37f]/10 to-[#10a37f]/5 rounded-xl p-5 border border-[#10a37f]/30 animate-scaleIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10a37f]/20 flex items-center justify-center">
            <span className="text-[#10a37f] text-xl">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Final Answer</h3>
            <p className="text-xs text-[#b4b4b4]">
              via {answer.source_agent} • {answer.strategy}
            </p>
          </div>
        </div>
        {answer.evaluated_responses && (
          <span className="px-3 py-1 bg-[#10a37f]/20 text-[#10a37f] rounded-full text-sm">
            {answer.evaluated_responses} evaluated
          </span>
        )}
      </div>
      
      {/* Answer Content */}
      <div className="bg-[#212121] rounded-lg p-4 mb-4">
        <div className="text-[#ececec] leading-relaxed whitespace-pre-wrap prose">
          {answer.content}
        </div>
      </div>
      
      {/* Confidence */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#b4b4b4]">Confidence</span>
          <span className={`font-medium ${getConfidenceTextColor(answer.confidence)}`}>
            {answer.confidence}%
          </span>
        </div>
        <div className="h-2 bg-[#212121] rounded-full overflow-hidden">
          <div 
            className={`h-full ${getConfidenceColor(answer.confidence)} rounded-full transition-all duration-500`}
            style={{ width: `${answer.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
