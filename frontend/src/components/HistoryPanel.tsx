'use client';

import React from 'react';
import { Interaction } from '@/types';

interface HistoryPanelProps {
  interactions: Interaction[];
  onSelect: (interaction: Interaction) => void;
  isLoading: boolean;
}

export default function HistoryPanel({ interactions, onSelect, isLoading }: HistoryPanelProps) {
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
          <span className="text-2xl">◫</span>
        </div>
        <p>No interactions yet</p>
        <p className="text-sm mt-1">Ask a question to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {interactions.map((interaction) => (
        <button
          key={interaction.id}
          onClick={() => onSelect(interaction)}
          className="w-full text-left p-3 rounded-lg bg-[#212121] border border-[#424242] hover:border-[#565656] hover:bg-[#2f2f2f] transition-all duration-200 group"
        >
          <p className="text-sm text-[#ececec] line-clamp-2 mb-2 group-hover:text-white">
            {interaction.query}
          </p>
          <div className="flex items-center justify-between text-xs text-[#565656]">
            <span>
              {new Date(interaction.timestamp).toLocaleDateString()}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${
              interaction.final_confidence >= 80 ? 'bg-[#10a37f]/20 text-[#10a37f]' :
              interaction.final_confidence >= 60 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
              'bg-[#ef4444]/20 text-[#ef4444]'
            }`}>
              {interaction.final_confidence}%
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
