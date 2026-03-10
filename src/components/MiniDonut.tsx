interface MiniDonutProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function MiniDonut({ percentage, size = 64, strokeWidth = 5 }: MiniDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;
  const remaining = circumference - filled;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--light-green))"
          strokeWidth={strokeWidth}
        />
        {/* Filled */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${remaining}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-primary">{percentage}%</span>
    </div>
  );
}
