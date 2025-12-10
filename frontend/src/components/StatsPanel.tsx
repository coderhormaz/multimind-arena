'use client';

import React from 'react';
import { Stats } from '@/types';

interface StatsPanelProps {
  stats: Stats | null;
  isLoading: boolean;
}

export default function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!stats || stats.total_interactions === 0) {
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
        <p>No statistics yet</p>
        <p className="text-sm mt-1">Complete some interactions first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{stats.total_interactions}</p>
          <p className="text-xs text-gray-400 mt-1">Total Interactions</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{stats.avg_processing_time}s</p>
          <p className="text-xs text-gray-400 mt-1">Avg. Time</p>
        </div>
      </div>
      
      {/* Agent Stats */}
      {stats.agent_stats && Object.keys(stats.agent_stats).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Agent Performance</h4>
          
          {stats.agent_stats.agentA && (
            <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
              <div>
                <p className="text-sm text-blue-400 font-medium">Agent A (Reasoner)</p>
                <p className="text-xs text-gray-500">Llama 3.1 70B</p>
              </div>
              <span className="text-sm text-blue-300">{stats.agent_stats.agentA.avg_time}s avg</span>
            </div>
          )}
          
          {stats.agent_stats.agentB && (
            <div className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg border border-orange-800/50">
              <div>
                <p className="text-sm text-orange-400 font-medium">Agent B (Critic)</p>
                <p className="text-xs text-gray-500">Qwen 2.5 72B</p>
              </div>
              <span className="text-sm text-orange-300">{stats.agent_stats.agentB.avg_time}s avg</span>
            </div>
          )}
          
          {stats.agent_stats.referee && (
            <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-800/50">
              <div>
                <p className="text-sm text-green-400 font-medium">Referee (Judge)</p>
                <p className="text-xs text-gray-500">Gemma 2 27B</p>
              </div>
              <span className="text-sm text-green-300">{stats.agent_stats.referee.avg_time}s avg</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
