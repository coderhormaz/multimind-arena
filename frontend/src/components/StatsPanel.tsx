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
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_interactions === 0) {
    return (
      <div className="text-center py-8 text-[#565656]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#212121] flex items-center justify-center">
          <span className="text-2xl">◊</span>
        </div>
        <p>No statistics yet</p>
        <p className="text-sm mt-1">Complete some interactions first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#212121] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total_interactions}</p>
          <p className="text-xs text-[#b4b4b4] mt-1">Interactions</p>
        </div>
        <div className="bg-[#212121] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#10a37f]">{stats.avg_processing_time}s</p>
          <p className="text-xs text-[#b4b4b4] mt-1">Avg. Time</p>
        </div>
      </div>
      
      {/* Agent Stats */}
      {stats.agent_stats && Object.keys(stats.agent_stats).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#b4b4b4]">Agent Performance</h4>
          
          {stats.agent_stats.agentA && (
            <div className="flex items-center justify-between p-3 bg-[#212121] rounded-lg border border-[#424242]">
              <div className="flex items-center gap-2">
                <span className="text-[#3b82f6]">◇</span>
                <div>
                  <p className="text-sm text-white font-medium">Reasoner</p>
                  <p className="text-xs text-[#565656]">Llama 3.1 70B</p>
                </div>
              </div>
              <span className="text-sm text-[#b4b4b4]">{stats.agent_stats.agentA.avg_time}s</span>
            </div>
          )}
          
          {stats.agent_stats.agentB && (
            <div className="flex items-center justify-between p-3 bg-[#212121] rounded-lg border border-[#424242]">
              <div className="flex items-center gap-2">
                <span className="text-[#f59e0b]">◎</span>
                <div>
                  <p className="text-sm text-white font-medium">Critic</p>
                  <p className="text-xs text-[#565656]">Qwen 2.5 72B</p>
                </div>
              </div>
              <span className="text-sm text-[#b4b4b4]">{stats.agent_stats.agentB.avg_time}s</span>
            </div>
          )}
          
          {stats.agent_stats.referee && (
            <div className="flex items-center justify-between p-3 bg-[#212121] rounded-lg border border-[#424242]">
              <div className="flex items-center gap-2">
                <span className="text-[#10a37f]">⚖</span>
                <div>
                  <p className="text-sm text-white font-medium">Judge</p>
                  <p className="text-xs text-[#565656]">Gemma 2 27B</p>
                </div>
              </div>
              <span className="text-sm text-[#b4b4b4]">{stats.agent_stats.referee.avg_time}s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
