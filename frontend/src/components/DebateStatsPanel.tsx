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
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
          <span className="w-2 h-2 bg-[#10a37f] rounded-full thinking-dot"></span>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_debates === 0) {
    return (
      <div className="text-center py-8 text-[#565656]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#212121] flex items-center justify-center">
          <span className="text-2xl">◊</span>
        </div>
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
        <div className="bg-[#212121] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total_debates}</p>
          <p className="text-xs text-[#b4b4b4] mt-1">Debates</p>
        </div>
        <div className="bg-[#212121] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#10a37f]">{stats.avg_processing_time}s</p>
          <p className="text-xs text-[#b4b4b4] mt-1">Avg. Time</p>
        </div>
      </div>
      
      {/* Win Rates */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#b4b4b4] flex items-center gap-2">
          <span className="text-[#f59e0b]">★</span> Win Statistics
        </h4>
        
        {/* Reasoner A */}
        <div className="p-3 bg-[#212121] rounded-lg border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#3b82f6] font-medium flex items-center gap-1.5">
              <span>◇</span> Reasoner A
            </span>
            <span className="text-sm text-[#b4b4b4]">{stats.reasoner_a_wins} wins</span>
          </div>
          <div className="w-full bg-[#2f2f2f] rounded-full h-1.5">
            <div 
              className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.win_rate_a}%` }}
            ></div>
          </div>
          <p className="text-xs text-[#565656] mt-1.5">{stats.win_rate_a}% win rate</p>
        </div>
        
        {/* Reasoner B */}
        <div className="p-3 bg-[#212121] rounded-lg border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8b5cf6] font-medium flex items-center gap-1.5">
              <span>◈</span> Reasoner B
            </span>
            <span className="text-sm text-[#b4b4b4]">{stats.reasoner_b_wins} wins</span>
          </div>
          <div className="w-full bg-[#2f2f2f] rounded-full h-1.5">
            <div 
              className="bg-[#8b5cf6] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.win_rate_b}%` }}
            ></div>
          </div>
          <p className="text-xs text-[#565656] mt-1.5">{stats.win_rate_b}% win rate</p>
        </div>
        
        {/* Draws */}
        <div className="p-3 bg-[#212121] rounded-lg border border-[#424242]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#b4b4b4] font-medium flex items-center gap-1.5">
              <span>⚖</span> Draws
            </span>
            <span className="text-sm text-[#b4b4b4]">{stats.draws}</span>
          </div>
        </div>
      </div>
      
      {/* Visual Chart */}
      {totalDecided > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[#b4b4b4] mb-2">Win Distribution</h4>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#212121]">
            {stats.reasoner_a_wins > 0 && (
              <div 
                className="bg-[#3b82f6] transition-all duration-500"
                style={{ width: `${(stats.reasoner_a_wins / totalDecided) * 100}%` }}
                title={`Reasoner A: ${stats.reasoner_a_wins}`}
              ></div>
            )}
            {stats.draws > 0 && (
              <div 
                className="bg-[#565656] transition-all duration-500"
                style={{ width: `${(stats.draws / totalDecided) * 100}%` }}
                title={`Draws: ${stats.draws}`}
              ></div>
            )}
            {stats.reasoner_b_wins > 0 && (
              <div 
                className="bg-[#8b5cf6] transition-all duration-500"
                style={{ width: `${(stats.reasoner_b_wins / totalDecided) * 100}%` }}
                title={`Reasoner B: ${stats.reasoner_b_wins}`}
              ></div>
            )}
          </div>
          <div className="flex justify-between text-xs text-[#565656] mt-1">
            <span>Reasoner A</span>
            <span>Reasoner B</span>
          </div>
        </div>
      )}
    </div>
  );
}
