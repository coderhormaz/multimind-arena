'use client';

import React from 'react';

interface RoundHeaderProps {
  round: number;
  status: 'upcoming' | 'active' | 'complete';
  title?: string;
}

export default function RoundHeader({ round, status, title }: RoundHeaderProps) {
  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#424242] to-transparent"></div>
      <div className={`mx-4 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
        status === 'active' 
          ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b]' 
          : status === 'complete'
          ? 'bg-[#10a37f]/10 border border-[#10a37f]/30 text-[#10a37f]'
          : 'bg-[#2f2f2f] border border-[#424242] text-[#565656]'
      }`}>
        {status === 'active' && (
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full thinking-dot"></span>
            <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full thinking-dot"></span>
            <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full thinking-dot"></span>
          </div>
        )}
        {status === 'complete' && (
          <span>✓</span>
        )}
        <span className="font-medium text-sm">
          {title || `Round ${round}`}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#424242] to-transparent"></div>
    </div>
  );
}
