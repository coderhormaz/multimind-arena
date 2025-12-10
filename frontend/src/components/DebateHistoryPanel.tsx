'use client';

import React from 'react';
import { DebateInteraction } from '@/types';

interface DebateHistoryPanelProps {
  interactions: DebateInteraction[];
  onSelect: (interaction: DebateInteraction) => void;
  isLoading: boolean;
}

export default function DebateHistoryPanel({ interactions, onSelect, isLoading }: DebateHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
        </div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-[#565656]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#212121] flex items-center justify-center">
          <span className="text-2xl">⚔</span>
        </div>
        <p>No debates yet</p>
        <p className="text-sm mt-1">Start a debate to see history!</p>
      </div>
    );
  }

  const getWinnerBadge = (winner: string) => {
    if (winner === 'Reasoner A') {
      return <span className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-0.5 rounded">◇ A wins</span>;
    } else if (winner === 'Reasoner B') {
      return <span className="text-xs bg-[#8b5cf6]/20 text-[#8b5cf6] px-2 py-0.5 rounded">◈ B wins</span>;
    } else if (winner === 'Draw') {
      return <span className="text-xs bg-[#424242] text-[#b4b4b4] px-2 py-0.5 rounded">⚖ Draw</span>;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {interactions.map((interaction) => (
        <button
          key={interaction.id}
          onClick={() => onSelect(interaction)}
          className="w-full text-left p-3 rounded-lg bg-[#212121] border border-[#424242] hover:border-[#565656] hover:bg-[#2f2f2f] transition-all duration-200 group"
        >
          <p className="text-sm text-[#ececec] line-clamp-2 mb-2 group-hover:text-white">
            {interaction.question}
          </p>
          <div className="flex items-center justify-between text-xs text-[#565656]">
            <div className="flex items-center gap-2">
              <span>
                {new Date(interaction.timestamp).toLocaleDateString()}
              </span>
              <span className="text-[#424242]">•</span>
              <span>{interaction.num_rounds} rounds</span>
            </div>
            <div className="flex items-center gap-2">
              {getWinnerBadge(interaction.winner)}
              <span className="bg-[#2f2f2f] px-2 py-0.5 rounded text-[#b4b4b4]">
                {interaction.total_processing_time}s
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
