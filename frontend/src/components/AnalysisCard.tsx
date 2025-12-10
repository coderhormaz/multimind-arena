import { QueryAnalysis } from '@/types';

interface Props {
  analysis: QueryAnalysis;
}

export default function AnalysisCard({ analysis }: Props) {
  const getComplexityColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
      <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
        <span>🔍</span>
        Query Analysis
      </h3>
      
      <div className="space-y-3">
        {/* Query Type */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Type</span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm capitalize">
            {analysis.query_type}
          </span>
        </div>
        
        {/* Complexity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-sm">Complexity</span>
            <span className={`text-sm font-medium ${getComplexityColor(analysis.complexity_score)}`}>
              {analysis.complexity_score}/100
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.complexity_score < 30 ? 'bg-green-500' :
                analysis.complexity_score < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.complexity_score}%` }}
            />
          </div>
        </div>
        
        {/* Flags */}
        <div className="flex flex-wrap gap-2">
          {analysis.requires_debate && (
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
              ⚔️ Debate
            </span>
          )}
          {analysis.requires_deep_analysis && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              🔬 Deep Analysis
            </span>
          )}
          {analysis.requires_coding && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
              💻 Coding
            </span>
          )}
        </div>
        
        {/* Key Concepts */}
        {analysis.key_concepts && analysis.key_concepts.length > 0 && (
          <div>
            <span className="text-gray-500 text-xs">Key Concepts:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.key_concepts.map((concept, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Reasoning */}
        {analysis.reasoning && (
          <p className="text-xs text-gray-500 italic">
            {analysis.reasoning}
          </p>
        )}
      </div>
    </div>
  );
}
