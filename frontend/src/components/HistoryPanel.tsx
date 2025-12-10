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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
        <p>No interactions yet</p>
        <p className="text-sm mt-1">Ask a question to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <button
          key={interaction.id}
          onClick={() => onSelect(interaction)}
          className="w-full text-left p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-gray-800 transition-all duration-200"
        >
          <p className="text-sm text-gray-200 line-clamp-2 mb-2">
            {interaction.query}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {new Date(interaction.timestamp).toLocaleDateString()} {new Date(interaction.timestamp).toLocaleTimeString()}
            </span>
            <span className="bg-gray-700 px-2 py-0.5 rounded">
              {interaction.final_confidence}%
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
