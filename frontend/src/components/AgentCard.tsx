'use client';

import React from 'react';

interface AgentCardProps {
  title: string;
  role: string;
  status: 'idle' | 'processing' | 'complete' | 'error';
  content?: string;
  processingTime?: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export default function AgentCard({
  title,
  role,
  status,
  content,
  processingTime,
  colorClass,
  bgClass,
  borderClass,
}: AgentCardProps) {
  return (
    <div className={`rounded-xl border-2 ${borderClass} ${bgClass} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderClass} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            status === 'processing' ? 'animate-pulse bg-yellow-400' :
            status === 'complete' ? 'bg-green-400' :
            status === 'error' ? 'bg-red-400' :
            'bg-gray-500'
          }`} />
          <div>
            <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
            <p className="text-xs text-gray-400">{role}</p>
          </div>
        </div>
        {processingTime !== undefined && status === 'complete' && (
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {processingTime}s
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {status === 'idle' && (
          <p className="text-gray-500 text-sm italic">Waiting...</p>
        )}
        
        {status === 'processing' && (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <p className="text-gray-400 animate-pulse-glow">Processing...</p>
          </div>
        )}
        
        {status === 'complete' && content && (
          <div className="prose text-sm text-gray-200 whitespace-pre-wrap">
            {content}
          </div>
        )}
        
        {status === 'error' && (
          <p className="text-red-400 text-sm">An error occurred. Please try again.</p>
        )}
      </div>
    </div>
  );
}
