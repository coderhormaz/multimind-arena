'use client';

import React from 'react';
import { DebateStats } from '@/types';

interface DebateStatsPanelProps {
  stats: DebateStats | null;
  isLoading: boolean;
}

export default function DebateStatsPanel({ stats, isLoading }: DebateStatsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!stats || stats.total_debates === 0) {
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <p>No debate statistics yet</p>
        <p className="text-sm mt-1">Start a debate to see stats!</p>
      </div>
    );
  }

  const totalDecided = stats.reasoner_a_wins + stats.reasoner_b_wins + stats.draws;

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{stats.total_debates}</p>
          <p className="text-xs text-gray-400 mt-1">Total Debates</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{stats.avg_processing_time}s</p>
          <p className="text-xs text-gray-400 mt-1">Avg. Time</p>
        </div>
      </div>
      
      {/* Win Rates */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <span>🏆</span> Win Statistics
        </h4>
        
        {/* Reasoner A */}
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-400 font-medium">🔵 Reasoner A</span>
            <span className="text-sm text-blue-300">{stats.reasoner_a_wins} wins</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.win_rate_a}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.win_rate_a}% win rate</p>
        </div>
        
        {/* Reasoner B */}
        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-400 font-medium">🟣 Reasoner B</span>
            <span className="text-sm text-purple-300">{stats.reasoner_b_wins} wins</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.win_rate_b}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.win_rate_b}% win rate</p>
        </div>
        
        {/* Draws */}
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">⚖️ Draws</span>
            <span className="text-sm text-gray-300">{stats.draws}</span>
          </div>
        </div>
      </div>
      
      {/* Visual Chart */}
      {totalDecided > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Win Distribution</h4>
          <div className="flex h-4 rounded-full overflow-hidden bg-gray-700">
            {stats.reasoner_a_wins > 0 && (
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(stats.reasoner_a_wins / totalDecided) * 100}%` }}
                title={`Reasoner A: ${stats.reasoner_a_wins}`}
              ></div>
            )}
            {stats.draws > 0 && (
              <div 
                className="bg-gray-500 transition-all duration-500"
                style={{ width: `${(stats.draws / totalDecided) * 100}%` }}
                title={`Draws: ${stats.draws}`}
              ></div>
            )}
            {stats.reasoner_b_wins > 0 && (
              <div 
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${(stats.reasoner_b_wins / totalDecided) * 100}%` }}
                title={`Reasoner B: ${stats.reasoner_b_wins}`}
              ></div>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Reasoner A</span>
            <span>Reasoner B</span>
          </div>
        </div>
      )}
    </div>
  );
}
