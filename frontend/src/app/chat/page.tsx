'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Code Block Component with Copy and Preview buttons
function CodeBlock({ code, language, blockKey }: { code: string; language: string; blockKey: string }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Check if code is previewable (HTML, CSS, or has HTML structure)
  const isPreviewable = language === 'html' || 
    language === 'css' || 
    language === 'jsx' ||
    language === 'tsx' ||
    code.includes('<') && code.includes('>');
  
  const getPreviewContent = () => {
    if (language === 'html' || (code.includes('<') && code.includes('>'))) {
      // If it's just CSS, wrap it
      if (language === 'css') {
        return `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="preview">Preview Content</div></body></html>`;
      }
      // If it doesn't have html/body tags, wrap it
      if (!code.toLowerCase().includes('<html') && !code.toLowerCase().includes('<!doctype')) {
        return `<!DOCTYPE html><html><head><style>body{font-family:system-ui;padding:20px;background:#1a1a1a;color:#fff;}</style></head><body>${code}</body></html>`;
      }
      return code;
    }
    return code;
  };
  
  return (
    <div className="relative group my-3">
      {/* Header bar with language and buttons */}
      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-1.5 rounded-t-lg border border-b-0 border-[#333]">
        <span className="text-[10px] text-[#888] font-mono uppercase">{language || 'code'}</span>
        <div className="flex items-center gap-1">
          {isPreviewable && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${
                showPreview 
                  ? 'bg-[#10a37f] text-white' 
                  : 'bg-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#333]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {showPreview ? 'Code' : 'Preview'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${
              copied 
                ? 'bg-[#10a37f] text-white' 
                : 'bg-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#333]'
            }`}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Code or Preview content */}
      {showPreview && isPreviewable ? (
        <div className="border border-t-0 border-[#333] rounded-b-lg overflow-hidden">
          <iframe
            srcDoc={getPreviewContent()}
            className="w-full h-64 bg-white"
            sandbox="allow-scripts"
            title="Code Preview"
          />
        </div>
      ) : (
        <pre className="bg-[#0d0d0d] rounded-b-lg p-3 overflow-x-auto border border-t-0 border-[#333]">
          <code className="text-sm font-mono text-[#e5e5e5] whitespace-pre">{code}</code>
        </pre>
      )}
    </div>
  );
}

// Agent model mapping for display - using symbols instead of emojis
const AGENT_MODELS: Record<string, { model: string; icon: string; color: string; role: string }> = {
  'gemini': { model: 'google/gemini-2.0-flash-exp:free', icon: '◇', color: '#10a37f', role: 'Fast Reasoner' },
  'deepseek': { model: 'tngtech/deepseek-r1t-chimera:free', icon: '◈', color: '#3b82f6', role: 'Deep Analyzer' },
  'qwen_coder': { model: 'qwen/qwen3-coder:free', icon: '⟨⟩', color: '#f59e0b', role: 'Code Specialist' },
  'gpt_critic': { model: 'openai/gpt-oss-20b:free', icon: '◎', color: '#ef4444', role: 'Error Detector' },
  'llama_judge': { model: 'meta-llama/llama-3.3-70b-instruct:free', icon: '⚖', color: '#8b5cf6', role: 'Final Arbiter' },
  'gemma': { model: 'google/gemma-3-27b-it:free', icon: '◆', color: '#ec4899', role: 'Balanced Reasoner' },
};

interface QueryAnalysis {
  query_type: string;
  complexity_score: number;
  requires_debate: boolean;
  requires_deep_analysis: boolean;
  requires_coding: boolean;
  key_concepts: string[];
  recommended_agents: string[];
  estimated_rounds: number;
  reasoning: string;
}

interface WorkflowStep {
  step: number;
  agent: string;
  name: string;
  task: string;
  icon: string;
  color: string;
}

interface WorkflowPlan {
  name: string;
  strategy: string;
  complexity: string;
  total_steps: number;
  agents: string[];
  debate_enabled: boolean;
  steps: WorkflowStep[];
}

interface AgentResponse {
  step_number: number;
  agent_id: string;
  agent_name: string;
  task: string;
  content: string;
  confidence: number;
  icon: string;
  color: string;
  isStreaming?: boolean;
  displayedContent?: string;
}

interface FinalAnswerData {
  content: string;
  confidence: number;
  strategy: string;
  source_agent: string;
  evaluated_responses?: number;
  isStreaming?: boolean;
  displayedContent?: string;
}

interface CompletionData {
  total_time: number;
  total_steps: number;
  total_agents: number;
  correction_loops: number;
  final_confidence: number;
  workflow_name: string;
}

// Simple markdown renderer
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  // Clean up HTML entities and tags - use placeholder for <br> in tables
  text = text
    .replace(/<br\s*\/?>/gi, '<<<BR>>>')  // Use placeholder for <br> tags (converted later in cells)
    .replace(/&nbsp;/g, ' ')               // Convert &nbsp; to spaces
    .replace(/&lt;/g, '<')                 // Convert &lt; to <
    .replace(/&gt;/g, '>')                 // Convert &gt; to >
    .replace(/&amp;/g, '&')                // Convert &amp; to &
    .replace(/&quot;/g, '"')               // Convert &quot; to "
    .replace(/&#39;/g, "'");               // Convert &#39; to '
  
  // Helper to process inline markdown (bold, italic, code)
  const processInlineMarkdown = (text: string, key: string | number = ''): React.ReactNode => {
    let processed: React.ReactNode = text;
    
    // Bold **text** or __text__
    if (typeof processed === 'string') {
      const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.slice(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${key}-${match.index}`} className="font-semibold text-white">{match[1] || match[2]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      if (parts.length > 0) {
        if (lastIndex < processed.length) {
          parts.push(processed.slice(lastIndex));
        }
        processed = parts;
      }
    }
    
    // Italic *text* or _text_
    if (typeof processed === 'string') {
      const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = italicRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.slice(lastIndex, match.index));
        }
        parts.push(<em key={`italic-${key}-${match.index}`} className="italic text-[#d4d4d4]">{match[1] || match[2]}</em>);
        lastIndex = match.index + match[0].length;
      }
      
      if (parts.length > 0) {
        if (lastIndex < processed.length) {
          parts.push(processed.slice(lastIndex));
        }
        processed = parts;
      }
    }
    
    // Inline code `code`
    if (typeof processed === 'string') {
      const codeRegex = /`([^`]+)`/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = codeRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.slice(lastIndex, match.index));
        }
        parts.push(<code key={`inline-${key}-${match.index}`} className="bg-[#171717] px-1.5 py-0.5 rounded text-sm font-mono text-[#f59e0b]">{match[1]}</code>);
        lastIndex = match.index + match[0].length;
      }
      
      if (parts.length > 0) {
        if (lastIndex < processed.length) {
          parts.push(processed.slice(lastIndex));
        }
        processed = parts;
      }
    }
    
    return processed;
  };
  
  // Split into lines for processing
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let inTable = false;
  let tableRows: string[][] = [];
  let isTableHeader = false;
  
  const processCellContent = (cellText: string, key: string): React.ReactNode => {
    // Convert placeholder back to line breaks
    const trimmed = cellText.replace(/<<<BR>>>/g, '\n').trim();
    
    // Handle empty cells
    if (!trimmed) {
      return <span className="text-[#666]">—</span>;
    }
    
    // Split by actual newlines (from placeholders)
    const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
    
    // If no lines after filtering, return empty indicator
    if (lines.length === 0) {
      return <span className="text-[#666]">—</span>;
    }
    
    const cellElements: React.ReactNode[] = [];
    
    lines.forEach((line, idx) => {
      if (!line) return;
      
      // Check if it's a bullet point
      if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.startsWith('•') ? line.slice(1).trim() : line.slice(2).trim();
        cellElements.push(
          <div key={`${key}-bullet-${idx}`} className="flex gap-2 my-1">
            <span className="text-[#10a37f] mt-0.5 flex-shrink-0">•</span>
            <span className="flex-1">{processInlineMarkdown(bulletText, `${key}-${idx}`)}</span>
          </div>
        );
      } else {
        // Regular text
        cellElements.push(
          <div key={`${key}-line-${idx}`} className={idx > 0 ? "mt-2" : ""}>
            {processInlineMarkdown(line, `${key}-${idx}`)}
          </div>
        );
      }
    });
    
    return cellElements.length > 0 ? <>{cellElements}</> : <span className="text-[#666]">—</span>;
  };
  
  const flushTable = (atIndex: number) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      
      // Ensure all rows have the same number of columns as header
      const columnCount = headerRow.length;
      const normalizedBodyRows = bodyRows.map(row => {
        const normalized = [...row];
        // Pad with empty strings if row is shorter
        while (normalized.length < columnCount) {
          normalized.push('');
        }
        // Trim if row is longer
        return normalized.slice(0, columnCount);
      });
      
      elements.push(
        <div key={`table-${atIndex}`} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-[#404040] text-sm">
            <thead className="bg-[#1a1a1a]">
              <tr>
                {headerRow.map((cell, i) => {
                  const cleanHeader = cell.replace(/<<<BR>>>/g, ' ').trim();
                  return (
                    <th key={i} className="border border-[#404040] px-4 py-3 text-left font-semibold text-white align-top">
                      {cleanHeader || <span className="text-[#666]">—</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {normalizedBodyRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-[#1a1a1a]/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-[#404040] px-4 py-3 text-[#d4d4d4] align-top">
                      {processCellContent(cell, `td-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };
  
  lines.forEach((line, lineIndex) => {
    // Table detection (markdown tables use | as delimiter)
    if (line.trim().includes('|') && !inCodeBlock) {
      // Split by | but keep empty cells
      const rawCells = line.split('|');
      // Remove first and last if they're empty (from leading/trailing |)
      if (rawCells[0].trim() === '') rawCells.shift();
      if (rawCells.length > 0 && rawCells[rawCells.length - 1].trim() === '') rawCells.pop();
      
      const cells = rawCells.map(cell => cell.trim());
      
      // Check if it's a separator row (e.g., |---|---|)
      if (cells.length > 0 && cells.every(cell => /^-+$/.test(cell))) {
        isTableHeader = true;
        return;
      }
      
      if (cells.length > 0) {
        inTable = true;
        tableRows.push(cells);
        return;
      }
    } else if (inTable) {
      flushTable(lineIndex);
    }
    
    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeContent = '';
      } else {
        inCodeBlock = false;
        elements.push(
          <CodeBlock 
            key={`code-${lineIndex}`} 
            code={codeContent} 
            language={codeLanguage}
            blockKey={`code-${lineIndex}`}
          />
        );
      }
      return;
    }
    
    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      return;
    }
    
    // Process inline markdown using helper
    const processed = processInlineMarkdown(line, lineIndex);
    
    // Headers
    if (typeof processed === 'string' && processed.startsWith('### ')) {
      elements.push(<h3 key={`h3-${lineIndex}`} className="text-base font-semibold text-white mt-3 mb-1">{processed.slice(4)}</h3>);
      return;
    }
    if (typeof processed === 'string' && processed.startsWith('## ')) {
      elements.push(<h2 key={`h2-${lineIndex}`} className="text-lg font-semibold text-white mt-4 mb-2">{processed.slice(3)}</h2>);
      return;
    }
    if (typeof processed === 'string' && processed.startsWith('# ')) {
      elements.push(<h1 key={`h1-${lineIndex}`} className="text-xl font-bold text-white mt-4 mb-2">{processed.slice(2)}</h1>);
      return;
    }
    
    // Bullet points
    if (typeof processed === 'string' && (processed.startsWith('- ') || processed.startsWith('* ') || processed.startsWith('• '))) {
      const bulletContent = processed.startsWith('• ') ? processed.slice(2) : processed.slice(2);
      elements.push(
        <div key={`bullet-${lineIndex}`} className="flex gap-2 ml-2 my-1">
          <span className="text-[#10a37f] mt-0.5">•</span>
          <span className="flex-1">{processInlineMarkdown(bulletContent, `bullet-${lineIndex}`)}</span>
        </div>
      );
      return;
    }
    
    // Numbered lists
    const numberedMatch = typeof processed === 'string' ? processed.match(/^(\d+)\.\s(.+)$/) : null;
    if (numberedMatch) {
      elements.push(
        <div key={`num-${lineIndex}`} className="flex gap-2 ml-2 my-1">
          <span className="text-[#10a37f] min-w-[1.5rem] mt-0.5">{numberedMatch[1]}.</span>
          <span className="flex-1">{processInlineMarkdown(numberedMatch[2], `num-${lineIndex}`)}</span>
        </div>
      );
      return;
    }
    
    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={`empty-${lineIndex}`} className="h-2" />);
      return;
    }
    
    // Regular paragraph
    elements.push(<p key={`p-${lineIndex}`} className="mb-1">{processed}</p>);
  });
  
  // Flush any remaining table
  if (inTable) {
    flushTable(lines.length);
  }
  
  return elements;
}

// Typing effect hook - using refs to avoid stale closures
function useTypingEffect(text: string, speed: number = 10, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (!enabled) {
      setDisplayedText(text || '');
      setIsComplete(true);
      return;
    }
    
    // Reset for new text
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    
    if (!text) {
      setIsComplete(true);
      return;
    }
    
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        const chunkSize = Math.min(3, text.length - indexRef.current);
        const newText = text.slice(0, indexRef.current + chunkSize);
        setDisplayedText(newText);
        indexRef.current += chunkSize;
      } else {
        setIsComplete(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, enabled]);
  
  return { displayedText, isComplete };
}

// Streaming text component with markdown support
function StreamingText({ 
  text, 
  isStreaming, 
  onComplete,
  useMarkdown = true
}: { 
  text: string; 
  isStreaming: boolean;
  onComplete?: () => void;
  useMarkdown?: boolean;
}) {
  const { displayedText, isComplete } = useTypingEffect(text, 6, isStreaming);
  const onCompleteCalledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  
  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Reset the called flag when text changes (new streaming session)
  useEffect(() => {
    onCompleteCalledRef.current = false;
  }, [text]);
  
  useEffect(() => {
    if (isComplete && !onCompleteCalledRef.current && onCompleteRef.current) {
      onCompleteCalledRef.current = true;
      onCompleteRef.current();
    }
  }, [isComplete]);
  
  return (
    <div>
      {useMarkdown ? renderMarkdown(displayedText) : displayedText}
      {isStreaming && !isComplete && (
        <span className="inline-block w-2 h-4 bg-[#10a37f] ml-0.5 animate-pulse align-text-bottom" />
      )}
    </div>
  );
}

// Collapsible Agent Response component
function CollapsibleAgentResponse({
  response,
  index,
  isExpanded,
  isStreaming,
  onToggle,
  onStreamComplete
}: {
  response: AgentResponse;
  index: number;
  isExpanded: boolean;
  isStreaming: boolean;
  onToggle: () => void;
  onStreamComplete: () => void;
}) {
  const agentInfo = AGENT_MODELS[response.agent_id];
  
  return (
    <div className="animate-slideUp" style={{ animationDelay: `${index * 0.03}s` }}>
      <div className={`bg-[#2f2f2f] rounded-lg border transition-all duration-300 ${
        isStreaming ? 'border-[#10a37f]/50' : 'border-[#424242]'
      }`}>
        {/* Clickable Header */}
        <button 
          onClick={onToggle}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#3a3a3a] rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <span style={{ color: response.color || agentInfo?.color || '#b4b4b4' }}>
              {agentInfo?.icon || '○'}
            </span>
            <span className="font-medium text-white text-xs">{response.agent_name}</span>
            <span className="text-xs text-[#565656]">•</span>
            <span className="text-xs text-[#b4b4b4] truncate max-w-[200px]">{response.task}</span>
            {isStreaming && (
              <div className="flex gap-0.5 ml-1">
                <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${
              response.confidence >= 80 ? 'text-[#10a37f]' :
              response.confidence >= 60 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
            }`}>
              {response.confidence}%
            </span>
            <svg 
              className={`w-3 h-3 text-[#565656] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {/* Collapsible Content */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-3 pb-3 pt-0">
            <div className="text-[#ececec] text-xs leading-relaxed">
              <StreamingText 
                text={response.content} 
                isStreaming={isStreaming}
                onComplete={onStreamComplete}
              />
            </div>
            
            {/* Confidence bar */}
            <div className="mt-2 h-0.5 bg-[#212121] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  response.confidence >= 80 ? 'bg-[#10a37f]' :
                  response.confidence >= 60 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                }`}
                style={{ width: `${response.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('idle');
  const [phaseMessage, setPhaseMessage] = useState<string>('');
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowPlan | null>(null);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [activeAgent, setActiveAgent] = useState<{id: string; name: string; task: string} | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswerData | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfCorrections, setSelfCorrections] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set());
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Smart scroll - only auto-scroll if user is near bottom
  const scrollToBottom = useCallback(() => {
    if (!userHasScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userHasScrolled]);

  // Track if user scrolls up - use ref to avoid state updates during scroll
  const userScrolledRef = useRef(false);
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      const newValue = !isNearBottom;
      // Only update state if value actually changed
      if (userScrolledRef.current !== newValue) {
        userScrolledRef.current = newValue;
        setUserHasScrolled(newValue);
      }
    }
  }, []);

  // Reset scroll tracking when new query starts
  useEffect(() => {
    if (isProcessing) {
      setUserHasScrolled(false);
    }
  }, [isProcessing]);

  useEffect(() => {
    scrollToBottom();
  }, [responses, finalAnswer, activeAgent, userHasScrolled]);

  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isProcessing) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isProcessing]);

  // Auto-expand the currently streaming agent and collapse others
  useEffect(() => {
    if (streamingIndex !== null) {
      setExpandedAgents(new Set([streamingIndex]));
    }
  }, [streamingIndex]);

  // Memoized callback for stream completion
  const handleStreamComplete = useCallback((index: number) => {
    setResponses(prev => {
      // Check if already marked as not streaming to prevent duplicate updates
      if (!prev[index]?.isStreaming) return prev;
      return prev.map((r, i) => 
        i === index ? { ...r, isStreaming: false } : r
      );
    });
  }, []);

  const toggleAgentExpand = (index: number) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentPhase('starting');
    setPhaseMessage('Initializing Master Controller...');
    setAnalysis(null);
    setWorkflow(null);
    setResponses([]);
    setActiveAgent(null);
    setFinalAnswer(null);
    setCompletionData(null);
    setError(null);
    setSelfCorrections(0);

    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) throw new Error('Failed to start query');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('complete');
      setActiveAgent(null);
    }
  };

  const handleSSEEvent = (data: any) => {
    switch (data.type) {
      case 'master_start':
        setCurrentPhase('analyzing');
        setPhaseMessage('Master Controller analyzing your query...');
        break;
      
      case 'analysis_complete':
        setAnalysis(data.analysis);
        setCurrentPhase('designing');
        setPhaseMessage('Designing optimal workflow...');
        break;
      
      case 'workflow_designed':
        setWorkflow(data.workflow);
        setCurrentPhase('executing');
        setPhaseMessage('Starting workflow execution...');
        break;
      
      case 'agent_start':
        setActiveAgent({
          id: data.agent_id,
          name: data.agent_name,
          task: data.task
        });
        setPhaseMessage(`${data.agent_name} is working on: ${data.task}`);
        break;
      
      case 'agent_waiting':
        setPhaseMessage(`${data.agent_name || 'Agent'} waiting for API (${data.wait_time || ''}s)... Rate limit`);
        break;
      
      case 'agent_retry':
        setPhaseMessage(`${data.agent_name || 'Agent'} retrying (attempt ${data.attempt || '?'})...`);
        break;
      
      case 'agent_complete':
        // Add response with streaming flag
        const newIndex = responses.length;
        setStreamingIndex(newIndex);
        setResponses(prev => [...prev, {
          step_number: data.step,
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          task: data.task,
          content: data.content,
          confidence: data.confidence,
          icon: data.icon,
          color: data.color,
          isStreaming: true,
          displayedContent: ''
        }]);
        setActiveAgent(null);
        break;
      
      case 'routing':
        setPhaseMessage(`Routing: ${data.from_agent} → ${data.to_agent}`);
        break;
      
      case 'self_correction':
        setSelfCorrections(prev => prev + 1);
        setCurrentPhase('self_correcting');
        setPhaseMessage(`Self-correction loop ${data.loop}: ${data.reason}`);
        break;
      
      case 'synthesizing':
        setCurrentPhase('synthesizing');
        setPhaseMessage('Synthesizing final answer from all responses...');
        break;
      
      case 'final_answer':
        // Collapse all agent responses when final answer starts
        setExpandedAgents(new Set());
        setStreamingIndex(null);
        setFinalAnswer({
          content: data.content,
          confidence: data.confidence,
          strategy: data.strategy,
          source_agent: data.source_agent,
          evaluated_responses: data.evaluated_responses,
          isStreaming: true,
          displayedContent: ''
        });
        setCurrentPhase('complete');
        setPhaseMessage('Complete!');
        break;
      
      case 'complete':
        setCompletionData({
          total_time: data.total_time,
          total_steps: data.total_steps,
          total_agents: data.total_agents,
          correction_loops: data.correction_loops,
          final_confidence: data.final_confidence,
          workflow_name: data.workflow_name
        });
        break;
      
      case 'error':
        setError(data.error);
        break;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-orange-400';
  };

  return (
    <main className="h-screen flex flex-col bg-[#212121]">
      {/* Compact Header */}
      <header className="flex-shrink-0 border-b border-[#424242] bg-[#212121]">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#10a37f] flex items-center justify-center">
              <span className="text-white font-bold text-sm">◈</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Master Controller AI</h1>
              <p className="text-[10px] text-[#565656]">6 Agents • Dynamic Workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2f2f2f] rounded-full border border-[#424242]">
                <div className="w-1.5 h-1.5 bg-[#10a37f] rounded-full animate-pulse"></div>
                <span className="text-xs text-[#b4b4b4] font-mono">{elapsedTime.toFixed(1)}s</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#2f2f2f] rounded-full border border-[#424242]">
              <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full status-online"></span>
              <span className="text-[10px] text-[#10a37f]">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
            
            {/* Welcome State */}
            {currentPhase === 'idle' && responses.length === 0 && !finalAnswer && (
              <div className="text-center py-10 animate-fadeIn">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#2f2f2f] border border-[#424242] flex items-center justify-center">
                  <span className="text-2xl text-[#10a37f]">◈</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">What can I help you with?</h2>
                <p className="text-sm text-[#b4b4b4] mb-6 max-w-md mx-auto">
                  Ask anything — I'll route your query through specialized AI agents.
                </p>
                
                {/* Agent Pills */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                  {Object.entries(AGENT_MODELS).map(([id, info]) => (
                    <div 
                      key={id} 
                      className="flex items-center gap-1.5 px-2 py-1 bg-[#2f2f2f] rounded-full border border-[#424242] hover:border-[#565656] transition-colors cursor-default"
                    >
                      <span className="text-sm" style={{ color: info.color }}>{info.icon}</span>
                      <span className="text-xs text-[#b4b4b4]">{info.role}</span>
                    </div>
                  ))}
                </div>

                {/* Quick prompts */}
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {[
                    'Explain quantum computing',
                    'Write a sorting algorithm',
                    'Compare REST vs GraphQL',
                    'Debug my Python code'
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(prompt)}
                      className="px-3 py-2 bg-[#2f2f2f] border border-[#424242] rounded-lg text-xs text-[#ececec] hover:bg-[#3a3a3a] hover:border-[#565656] transition-all text-left group"
                    >
                      <span className="text-[#b4b4b4] group-hover:text-[#ececec] transition-colors">{prompt}</span>
                      <span className="text-[#565656] ml-1">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Card */}
            {analysis && (
              <div className="bg-[#2f2f2f] rounded-lg p-3 border border-[#424242] animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#10a37f] text-sm">◇</span>
                  <span className="text-xs font-medium text-white">Query Analysis</span>
                  <div className="ml-auto flex gap-1">
                    {analysis.requires_debate && <span className="text-xs px-1 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded">⚔</span>}
                    {analysis.requires_deep_analysis && <span className="text-xs px-1 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] rounded">◈</span>}
                    {analysis.requires_coding && <span className="text-xs px-1 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] rounded">⟨⟩</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs mb-2">
                  <span className="text-[#b4b4b4]">Type: <span className="text-white capitalize">{analysis.query_type}</span></span>
                  <span className="text-[#b4b4b4]">Complexity: <span className="text-white">{analysis.complexity_score}/100</span></span>
                  <span className="text-[#b4b4b4]">Rounds: <span className="text-white">{analysis.estimated_rounds}</span></span>
                </div>

                {/* Complexity bar */}
                <div className="h-1 bg-[#212121] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      analysis.complexity_score > 70 ? 'bg-[#ef4444]' :
                      analysis.complexity_score > 40 ? 'bg-[#f59e0b]' : 'bg-[#10a37f]'
                    }`}
                    style={{ width: `${analysis.complexity_score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Workflow Progress */}
            {workflow && (
              <div className="bg-[#2f2f2f] rounded-lg p-3 border border-[#424242] animate-slideUp">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10a37f] text-sm">▷</span>
                    <span className="text-xs font-medium text-white">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      workflow.complexity === 'simple' ? 'bg-[#10a37f]/20 text-[#10a37f]' :
                      workflow.complexity === 'moderate' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                      'bg-[#ef4444]/20 text-[#ef4444]'
                    }`}>
                      {workflow.complexity}
                    </span>
                    {workflow.debate_enabled && (
                      <span className="px-1.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded text-xs">⚔</span>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {workflow.steps.map((step, index) => {
                    const isActive = activeAgent?.id === step.agent;
                    const isComplete = responses.some(r => r.step_number === step.step);
                    const agentInfo = AGENT_MODELS[step.agent];
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-xs ${
                          isActive 
                            ? 'border-[#10a37f] bg-[#10a37f]/10' 
                            : isComplete 
                              ? 'border-[#10a37f]/50 bg-[#212121]' 
                              : 'border-[#424242] bg-[#212121]'
                        }`}
                      >
                        <span style={{ color: agentInfo?.color || '#b4b4b4' }}>
                          {agentInfo?.icon || '○'}
                        </span>
                        <span className={isActive ? 'text-[#10a37f]' : isComplete ? 'text-white' : 'text-[#b4b4b4]'}>
                          {step.name}
                        </span>
                        {isComplete && <span className="text-[#10a37f]">✓</span>}
                        {isActive && (
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                            <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                            <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#212121] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10a37f] transition-all duration-500 rounded-full"
                      style={{ width: `${(responses.length / workflow.steps.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#565656]">{responses.length}/{workflow.steps.length}</span>
                </div>
              </div>
            )}

            {/* Agent Responses */}
            {responses.map((response, index) => (
              <CollapsibleAgentResponse
                key={`${index}-${response.agent_id}`}
                response={response}
                index={index}
                isExpanded={expandedAgents.has(index)}
                isStreaming={streamingIndex === index}
                onToggle={() => toggleAgentExpand(index)}
                onStreamComplete={() => handleStreamComplete(index)}
              />
            ))}

            {/* Active Agent Thinking */}
            {activeAgent && (
              <div className="bg-[#2f2f2f] rounded-lg px-3 py-2 border border-[#10a37f]/30 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                    <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                    <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                  </div>
                  <span className="text-white text-xs font-medium">{activeAgent.name}</span>
                  <span className="text-[#565656] text-xs">•</span>
                  <span className="text-[#b4b4b4] text-xs">{activeAgent.task}</span>
                </div>
              </div>
            )}

            {/* Final Answer with Collapsible Thinking */}
            {finalAnswer && (
              <div className="animate-scaleIn space-y-2">
                {/* Thinking/Process Dropdown - like ChatGPT */}
                {completionData && responses.length > 0 && (
                  <div className="bg-[#2f2f2f] rounded-lg border border-[#424242]">
                    <button
                      onClick={() => setThinkingExpanded(!thinkingExpanded)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#3a3a3a] rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#565656]">◎</span>
                        <span className="text-[#b4b4b4]">
                          Thought for {completionData.total_time.toFixed(1)}s
                        </span>
                        <span className="text-[#565656]">
                          • {responses.length} agents • {completionData.total_steps} steps
                        </span>
                      </div>
                      <svg 
                        className={`w-3 h-3 text-[#565656] transition-transform duration-200 ${thinkingExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Expanded thinking content */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      thinkingExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-3 pb-3 space-y-2">
                        {/* Summary stats */}
                        <div className="grid grid-cols-4 gap-1 p-2 bg-[#212121] rounded text-center">
                          <div>
                            <p className="text-xs font-medium text-white">{completionData.total_time.toFixed(1)}s</p>
                            <p className="text-[10px] text-[#565656]">Time</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{completionData.total_steps}</p>
                            <p className="text-[10px] text-[#565656]">Steps</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{completionData.total_agents}</p>
                            <p className="text-[10px] text-[#565656]">Agents</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#10a37f]">{completionData.final_confidence}%</p>
                            <p className="text-[10px] text-[#565656]">Conf.</p>
                          </div>
                        </div>
                        
                        {/* Agent responses summary */}
                        <div className="space-y-1.5">
                          {responses.map((response, idx) => {
                            const agentInfo = AGENT_MODELS[response.agent_id];
                            return (
                              <div key={idx} className="p-2 bg-[#212121] rounded">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-xs" style={{ color: agentInfo?.color || '#b4b4b4' }}>
                                    {agentInfo?.icon || '○'}
                                  </span>
                                  <span className="text-xs font-medium text-white">{response.agent_name}</span>
                                  <span className="text-[10px] text-[#565656]">• {response.task}</span>
                                  <span className={`ml-auto text-[10px] ${
                                    response.confidence >= 80 ? 'text-[#10a37f]' :
                                    response.confidence >= 60 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                                  }`}>
                                    {response.confidence}%
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#b4b4b4] leading-relaxed">
                                  {renderMarkdown(response.content)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Final Answer - always visible */}
                <div className="bg-[#212121] rounded-lg p-4">
                  <div className="text-[#ececec] text-sm leading-relaxed">
                    <StreamingText 
                      text={finalAnswer.content} 
                      isStreaming={finalAnswer.isStreaming || false}
                      onComplete={() => setFinalAnswer(prev => prev ? { ...prev, isStreaming: false } : null)}
                      useMarkdown={true}
                    />
                  </div>
                  
                  {/* Confidence bar at bottom */}
                  {!finalAnswer.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-[#2f2f2f]">
                      <div className="flex items-center justify-between text-[10px] text-[#565656]">
                        <span>via {finalAnswer.source_agent} • {finalAnswer.strategy}</span>
                        <span className={`${
                          finalAnswer.confidence >= 80 ? 'text-[#10a37f]' :
                          finalAnswer.confidence >= 60 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                        }`}>
                          {finalAnswer.confidence}% confident
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-[#ef4444]">
                  <span className="text-xs">✕</span>
                  <span className="text-xs">{error}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-[#424242] bg-[#212121]">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Status indicator */}
            {currentPhase !== 'idle' && currentPhase !== 'complete' && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                  <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                  <span className="w-1 h-1 bg-[#10a37f] rounded-full thinking-dot"></span>
                </div>
                <span className="text-xs text-[#b4b4b4]">{phaseMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative bg-[#2f2f2f] rounded-xl border border-[#424242] focus-within:border-[#10a37f] transition-all duration-200" style={{ outline: 'none' }}>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask anything..."
                  rows={1}
                  className="w-full px-3 py-2.5 pr-10 bg-transparent text-white placeholder-[#6b6b6b] resize-none text-sm max-h-32 scrollbar-hide"
                  style={{ minHeight: '38px', outline: 'none', border: 'none', boxShadow: 'none' }}
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-lg bg-[#10a37f] hover:bg-[#1a7f64] disabled:bg-[#424242] disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {isProcessing ? (
                    <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
