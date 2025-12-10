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
    gradient: 'from-blue-600 to-blue-800',
    border: 'border-blue-500',
    bg: 'bg-blue-900/30',
    text: 'text-blue-400',
    icon: '🔵',
    align: 'items-start',
  },
  reasoner_b: {
    gradient: 'from-purple-600 to-purple-800',
    border: 'border-purple-500',
    bg: 'bg-purple-900/30',
    text: 'text-purple-400',
    icon: '🟣',
    align: 'items-end',
  },
  critic: {
    gradient: 'from-orange-600 to-orange-800',
    border: 'border-orange-500',
    bg: 'bg-orange-900/30',
    text: 'text-orange-400',
    icon: '🟠',
    align: 'items-center',
  },
  referee: {
    gradient: 'from-emerald-600 to-emerald-800',
    border: 'border-emerald-500',
    bg: 'bg-emerald-900/30',
    text: 'text-emerald-400',
    icon: '🏆',
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
      style={{ animationDuration: '0.5s' }}
    >
      <div 
        className={`max-w-[85%] rounded-2xl border ${style.border} ${style.bg} overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl`}
      >
        {/* Header */}
        <div className={`px-4 py-2 bg-gradient-to-r ${style.gradient} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{style.icon}</span>
            <span className="font-semibold text-white text-sm">{agentName}</span>
            {round && (
              <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
                Round {round}{isDefense ? ' Defense' : ''}
              </span>
            )}
          </div>
          {status === 'complete' && processingTime !== undefined && (
            <span className="text-xs text-white/70">{processingTime}s</span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {status === 'idle' && (
            <p className="text-gray-500 text-sm italic">Waiting for turn...</p>
          )}
          
          {status === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full ${style.text.replace('text', 'bg')} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                <div className={`w-2 h-2 rounded-full ${style.text.replace('text', 'bg')} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                <div className={`w-2 h-2 rounded-full ${style.text.replace('text', 'bg')} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className={`${style.text} text-sm animate-pulse`}>Thinking...</p>
            </div>
          )}
          
          {status === 'complete' && content && (
            <div className="prose prose-sm text-gray-200 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {content}
            </div>
          )}
          
          {status === 'error' && (
            <p className="text-red-400 text-sm">An error occurred</p>
          )}
        </div>
      </div>
    </div>
  );
}
