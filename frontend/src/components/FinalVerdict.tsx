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
        icon: '◇',
        color: 'text-[#3b82f6]',
        bg: 'bg-[#3b82f6]/10',
        border: 'border-[#3b82f6]/30',
      };
    } else if (winner === 'Reasoner B') {
      return {
        icon: '◈',
        color: 'text-[#8b5cf6]',
        bg: 'bg-[#8b5cf6]/10',
        border: 'border-[#8b5cf6]/30',
      };
    }
    return {
      icon: '⚖',
      color: 'text-[#b4b4b4]',
      bg: 'bg-[#2f2f2f]',
      border: 'border-[#424242]',
    };
  };

  const style = getWinnerStyle();

  return (
    <div className="mt-6 space-y-4 animate-scaleIn">
      {/* Winner Banner */}
      <div className={`rounded-xl border ${style.border} ${style.bg} p-4 text-center`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className={`text-2xl ${style.color}`}>{style.icon}</span>
          <span className="text-2xl text-[#f59e0b]">★</span>
          <span className={`text-2xl ${style.color}`}>{style.icon}</span>
        </div>
        <h3 className={`text-xl font-semibold ${style.color}`}>
          {winner === 'Draw' ? 'Debate Ended in a Draw!' : `${winner} Wins!`}
        </h3>
        <p className="text-sm text-[#b4b4b4] mt-1">
          After {totalRounds} rounds of debate
        </p>
      </div>

      {/* Final Answer */}
      <div className="rounded-xl border border-[#10a37f]/30 bg-[#10a37f]/10 overflow-hidden">
        <div className="px-4 py-3 bg-[#10a37f]/20 border-b border-[#10a37f]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#10a37f] text-lg">✓</span>
            <h3 className="font-medium text-white">Synthesized Final Answer</h3>
          </div>
          {totalTime !== undefined && (
            <span className="text-xs text-[#b4b4b4] bg-[#212121] px-2.5 py-1 rounded">
              {totalTime}s total
            </span>
          )}
        </div>
        
        <div className="p-5">
          <div className="prose text-[#ececec] whitespace-pre-wrap leading-relaxed">
            {finalAnswer}
          </div>
        </div>
      </div>
    </div>
  );
}
