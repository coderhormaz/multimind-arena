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
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      <div className={`mx-4 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
        status === 'active' 
          ? 'bg-yellow-900/50 border border-yellow-500 text-yellow-400 animate-pulse' 
          : status === 'complete'
          ? 'bg-green-900/30 border border-green-700 text-green-400'
          : 'bg-gray-800/50 border border-gray-700 text-gray-500'
      }`}>
        {status === 'active' && (
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></div>
        )}
        {status === 'complete' && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        <span className="font-semibold text-sm">
          {title || `Round ${round}`}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
    </div>
  );
}
