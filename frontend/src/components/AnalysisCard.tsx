import { QueryAnalysis } from '@/types';

interface Props {
  analysis: QueryAnalysis;
}

export default function AnalysisCard({ analysis }: Props) {
  const getComplexityColor = (score: number) => {
    if (score < 30) return 'text-[#10a37f]';
    if (score < 60) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  const getBarColor = (score: number) => {
    if (score < 30) return 'bg-[#10a37f]';
    if (score < 60) return 'bg-[#f59e0b]';
    return 'bg-[#ef4444]';
  };

  return (
    <div className="bg-[#2f2f2f] rounded-xl p-4 border border-[#424242]">
      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
        <span className="text-[#10a37f]">◇</span>
        Query Analysis
      </h3>
      
      <div className="space-y-3">
        {/* Query Type */}
        <div className="flex justify-between items-center">
          <span className="text-[#b4b4b4] text-sm">Type</span>
          <span className="px-2 py-1 bg-[#212121] text-white rounded text-sm capitalize">
            {analysis.query_type}
          </span>
        </div>
        
        {/* Complexity */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[#b4b4b4] text-sm">Complexity</span>
            <span className={`text-sm font-medium ${getComplexityColor(analysis.complexity_score)}`}>
              {analysis.complexity_score}/100
            </span>
          </div>
          <div className="h-1.5 bg-[#212121] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(analysis.complexity_score)}`}
              style={{ width: `${analysis.complexity_score}%` }}
            />
          </div>
        </div>
        
        {/* Flags */}
        <div className="flex flex-wrap gap-2">
          {analysis.requires_debate && (
            <span className="px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded text-xs">
              ⚔ Debate
            </span>
          )}
          {analysis.requires_deep_analysis && (
            <span className="px-2 py-1 bg-[#3b82f6]/20 text-[#3b82f6] rounded text-xs">
              ◈ Deep
            </span>
          )}
          {analysis.requires_coding && (
            <span className="px-2 py-1 bg-[#f59e0b]/20 text-[#f59e0b] rounded text-xs">
              ⟨⟩ Code
            </span>
          )}
        </div>
        
        {/* Key Concepts */}
        {analysis.key_concepts && analysis.key_concepts.length > 0 && (
          <div>
            <span className="text-[#565656] text-xs">Key Concepts</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.key_concepts.map((concept, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-[#212121] text-[#b4b4b4] rounded text-xs">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Reasoning */}
        {analysis.reasoning && (
          <p className="text-xs text-[#565656]">
            {analysis.reasoning}
          </p>
        )}
      </div>
    </div>
  );
}
