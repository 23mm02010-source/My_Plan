import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = false,
  color,
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const getBarColor = () => {
    if (color) return color;
    if (clamped === 100) return 'bg-emerald-500';
    if (clamped >= 70) return 'bg-primary-500';
    if (clamped >= 30) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${heightClasses[size]} border border-slate-700/40 relative`}>
        <div
          className={`${heightClasses[size]} ${getBarColor()} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold font-mono text-slate-300 min-w-[36px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
};
