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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg 
          className="w-12 h-12 mx-auto mb-3 opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        <p>No debates yet</p>
        <p className="text-sm mt-1">Start a debate to see history!</p>
      </div>
    );
  }

  const getWinnerBadge = (winner: string) => {
    if (winner === 'Reasoner A') {
      return <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full">🔵 A wins</span>;
    } else if (winner === 'Reasoner B') {
      return <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded-full">🟣 B wins</span>;
    } else if (winner === 'Draw') {
      return <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">⚖️ Draw</span>;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <button
          key={interaction.id}
          onClick={() => onSelect(interaction)}
          className="w-full text-left p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-gray-800 transition-all duration-200"
        >
          <p className="text-sm text-gray-200 line-clamp-2 mb-2">
            {interaction.question}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>
                {new Date(interaction.timestamp).toLocaleDateString()}
              </span>
              <span className="text-gray-600">•</span>
              <span>{interaction.num_rounds} rounds</span>
            </div>
            <div className="flex items-center gap-2">
              {getWinnerBadge(interaction.winner)}
              <span className="bg-gray-700 px-2 py-0.5 rounded">
                {interaction.total_processing_time}s
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
