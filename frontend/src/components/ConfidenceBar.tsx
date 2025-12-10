interface Props {
  confidence: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceBar({ confidence, label, size = 'md' }: Props) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-[#10a37f]';
    if (score >= 60) return 'bg-[#f59e0b]';
    return 'bg-[#ef4444]';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 80) return 'text-[#10a37f]';
    if (score >= 60) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[#b4b4b4] text-xs">{label}</span>
          <span className={`text-sm font-medium ${getConfidenceTextColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
      )}
      {!label && (
        <div className="flex items-center gap-2">
          <div className={`flex-1 ${heights[size]} bg-[#212121] rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${getConfidenceColor(confidence)} rounded-full transition-all duration-500`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${getConfidenceTextColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
      )}
      {label && (
        <div className={`${heights[size]} bg-[#212121] rounded-full overflow-hidden`}>
          <div 
            className={`h-full ${getConfidenceColor(confidence)} rounded-full transition-all duration-500`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      )}
    </div>
  );
}
