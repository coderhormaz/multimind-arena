'use client';

import React from 'react';

interface DebateMessageProps {
  agent: 'reasoner_a' | 'reasoner_b' | 'critic' | 'referee';
  agentName: string;
  round?: number;
  content?: string;
  processingTime?: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  isDefense?: boolean;
}

const agentStyles = {
  reasoner_a: {
    bgColor: 'bg-[#3b82f6]/10',
    border: 'border-[#3b82f6]/30',
    headerBg: 'bg-[#3b82f6]/20',
    text: 'text-[#3b82f6]',
    icon: '◇',
    align: 'items-start',
  },
  reasoner_b: {
    bgColor: 'bg-[#8b5cf6]/10',
    border: 'border-[#8b5cf6]/30',
    headerBg: 'bg-[#8b5cf6]/20',
    text: 'text-[#8b5cf6]',
    icon: '◈',
    align: 'items-end',
  },
  critic: {
    bgColor: 'bg-[#f59e0b]/10',
    border: 'border-[#f59e0b]/30',
    headerBg: 'bg-[#f59e0b]/20',
    text: 'text-[#f59e0b]',
    icon: '◎',
    align: 'items-center',
  },
  referee: {
    bgColor: 'bg-[#10a37f]/10',
    border: 'border-[#10a37f]/30',
    headerBg: 'bg-[#10a37f]/20',
    text: 'text-[#10a37f]',
    icon: '⚖',
    align: 'items-center',
  },
};

export default function DebateMessage({
  agent,
  agentName,
  round,
  content,
  processingTime,
  status,
  isDefense,
}: DebateMessageProps) {
  const style = agentStyles[agent];
  
  return (
    <div 
      className={`flex flex-col ${style.align} w-full animate-fadeIn`}
    >
      <div 
        className={`max-w-[85%] rounded-xl border ${style.border} ${style.bgColor} overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <div className={`px-4 py-2.5 ${style.headerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${style.text}`}>{style.icon}</span>
            <span className="font-medium text-white text-sm">{agentName}</span>
            {round && (
              <span className="text-xs text-[#b4b4b4] bg-[#212121] px-2 py-0.5 rounded">
                Round {round}{isDefense ? ' Defense' : ''}
              </span>
            )}
          </div>
          {status === 'complete' && processingTime !== undefined && (
            <span className="text-xs text-[#b4b4b4]">{processingTime}s</span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {status === 'idle' && (
            <p className="text-[#565656] text-sm">Waiting for turn...</p>
          )}
          
          {status === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text', 'bg')} thinking-dot`}></span>
                <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text', 'bg')} thinking-dot`}></span>
                <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text', 'bg')} thinking-dot`}></span>
              </div>
              <p className={`${style.text} text-sm`}>Thinking...</p>
            </div>
          )}
          
          {status === 'complete' && content && (
            <div className="prose text-sm text-[#ececec] whitespace-pre-wrap max-h-80 overflow-y-auto scrollbar-thin">
              {content}
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-[#ef4444]">
              <span>✕</span>
              <p className="text-sm">An error occurred</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
