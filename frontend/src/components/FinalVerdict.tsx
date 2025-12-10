'use client';

import React from 'react';

interface FinalVerdictProps {
  winner: string;
  finalAnswer: string;
  totalTime?: number;
  totalRounds?: number;
  isVisible: boolean;
}

export default function FinalVerdict({ 
  winner, 
  finalAnswer, 
  totalTime, 
  totalRounds,
  isVisible 
}: FinalVerdictProps) {
  if (!isVisible) return null;

  const getWinnerStyle = () => {
    if (winner === 'Reasoner A') {
      return {
        icon: '🔵',
        color: 'text-blue-400',
        bg: 'bg-blue-900/20',
        border: 'border-blue-500',
      };
    } else if (winner === 'Reasoner B') {
      return {
        icon: '🟣',
        color: 'text-purple-400',
        bg: 'bg-purple-900/20',
        border: 'border-purple-500',
      };
    }
    return {
      icon: '⚖️',
      color: 'text-gray-400',
      bg: 'bg-gray-800/50',
      border: 'border-gray-500',
    };
  };

  const style = getWinnerStyle();

  return (
    <div className="mt-6 space-y-4 animate-fadeIn">
      {/* Winner Banner */}
      <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-4 text-center`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">{style.icon}</span>
          <span className="text-2xl">🏆</span>
          <span className="text-3xl">{style.icon}</span>
        </div>
        <h3 className={`text-xl font-bold ${style.color}`}>
          {winner === 'Draw' ? 'Debate Ended in a Draw!' : `${winner} Wins!`}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          After {totalRounds} rounds of debate
        </p>
      </div>

      {/* Final Answer */}
      <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 overflow-hidden">
        <div className="px-4 py-3 bg-emerald-900/50 border-b border-emerald-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg 
              className="w-6 h-6 text-emerald-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="font-bold text-emerald-400 text-lg">🎯 Synthesized Final Answer</h3>
          </div>
          {totalTime !== undefined && (
            <span className="text-xs text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full">
              Total: {totalTime}s
            </span>
          )}
        </div>
        
        <div className="p-5">
          <div className="prose text-gray-100 whitespace-pre-wrap leading-relaxed">
            {finalAnswer}
          </div>
        </div>
      </div>
    </div>
  );
}
