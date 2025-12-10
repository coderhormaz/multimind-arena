interface Props {
  confidence: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceBar({ confidence, label, size = 'md' }: Props) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-xs">{label}</span>
          <span className={`text-sm font-medium ${getConfidenceTextColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
      )}
      {!label && (
        <div className="flex items-center gap-2">
          <div className={`flex-1 ${heights[size]} bg-gray-700 rounded-full overflow-hidden`}>
            <div 
              className={`h-full bg-gradient-to-r ${getConfidenceColor(confidence)} rounded-full transition-all duration-500`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${getConfidenceTextColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
      )}
      {label && (
        <div className={`${heights[size]} bg-gray-700 rounded-full overflow-hidden`}>
          <div 
            className={`h-full bg-gradient-to-r ${getConfidenceColor(confidence)} rounded-full transition-all duration-500`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      )}
    </div>
  );
}
