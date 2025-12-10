'use client';

import { FinalAnswerEvent } from '@/types';

interface Props {
  answer: FinalAnswerEvent;
}

export default function FinalAnswer({ answer }: Props) {
  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✅</span>
          <div>
            <h3 className="text-xl font-bold text-white">Final Answer</h3>
            <p className="text-sm text-gray-400">
              by {answer.source_agent} • Strategy: {answer.strategy}
            </p>
          </div>
        </div>
        {answer.evaluated_responses && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            {answer.evaluated_responses} responses evaluated
          </span>
        )}
      </div>
      
      {/* Answer Content */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
          {answer.content}
        </div>
      </div>
      
      {/* Confidence */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Answer Confidence</span>
          <span className="text-white font-medium">{answer.confidence}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              answer.confidence >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              answer.confidence >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
              'bg-gradient-to-r from-red-500 to-orange-500'
            }`}
            style={{ width: `${answer.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
