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
    <div className="bg-[#2f2f2f] rounded-xl border border-[#424242] overflow-hidden transition-all duration-300 hover:border-[#565656]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#424242] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            status === 'processing' ? 'bg-[#f59e0b] animate-pulse' :
            status === 'complete' ? 'bg-[#10a37f]' :
            status === 'error' ? 'bg-[#ef4444]' :
            'bg-[#565656]'
          }`} />
          <div>
            <h3 className="font-medium text-white text-sm">{title}</h3>
            <p className="text-xs text-[#b4b4b4]">{role}</p>
          </div>
        </div>
        {processingTime !== undefined && status === 'complete' && (
          <span className="text-xs text-[#b4b4b4] bg-[#212121] px-2 py-1 rounded-lg">
            {processingTime}s
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin">
        {status === 'idle' && (
          <p className="text-[#565656] text-sm">Waiting...</p>
        )}
        
        {status === 'processing' && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full thinking-dot"></span>
              <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full thinking-dot"></span>
              <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full thinking-dot"></span>
            </div>
            <p className="text-[#b4b4b4] text-sm">Processing...</p>
          </div>
        )}
        
        {status === 'complete' && content && (
          <div className="prose text-sm text-[#ececec] whitespace-pre-wrap">
            {content}
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center gap-2 text-[#ef4444]">
            <span>✕</span>
            <p className="text-sm">An error occurred. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
