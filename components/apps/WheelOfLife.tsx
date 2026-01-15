"use client";

interface Sector {
  id: string;
  name: string;
  level: number;
}

interface WheelOfLifeProps {
  sectors: Sector[];
  size?: number;
}

export function WheelOfLife({ sectors, size = 400 }: WheelOfLifeProps) {
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  const maxRadius = radius - 20;
  const minRadius = 30;

  if (sectors.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 10}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-gray-500"
          fontSize="16"
        >
          No sectors
        </text>
      </svg>
    );
  }

  const angleSlice = (Math.PI * 2) / sectors.length;

  const getCoordinates = (angle: number, distance: number) => {
    const x = centerX + distance * Math.cos(angle - Math.PI / 2);
    const y = centerY + distance * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const createSectorPath = (startAngle: number, endAngle: number, level: number) => {
    // Inner radius is constant (from center), outer radius depends on satisfaction level
    // Higher level = larger outer radius = more fill from center outward
    const innerRadius = minRadius;
    const outerRadius = minRadius + (maxRadius - minRadius) * (level / 10); // At level 0: minRadius, at level 10: maxRadius

    const start1 = getCoordinates(startAngle, innerRadius);
    const start2 = getCoordinates(startAngle, outerRadius);
    const end1 = getCoordinates(endAngle, innerRadius);
    const end2 = getCoordinates(endAngle, outerRadius);

    const largeArc = angleSlice > Math.PI ? 1 : 0;

    return `
      M ${start1.x} ${start1.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${end1.x} ${end1.y}
      L ${end2.x} ${end2.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${start2.x} ${start2.y}
      Z
    `;
  };

  const getColor = (index: number) => {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#ec4899", // pink
    ];
    return colors[index % colors.length];
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {/* Background circles */}
      <circle
        cx={centerX}
        cy={centerY}
        r={maxRadius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="1"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={minRadius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="1"
      />

      {/* Guide circles for levels */}
      {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
        <circle
          key={`guide-${ratio}`}
          cx={centerX}
          cy={centerY}
          r={minRadius + (maxRadius - minRadius) * ratio}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      ))}

      {/* Sectors */}
      {sectors.map((sector, index) => {
        const startAngle = index * angleSlice;
        const endAngle = (index + 1) * angleSlice;
        const midAngle = startAngle + angleSlice / 2;
        const labelRadius = (minRadius + maxRadius) / 2;
        const labelPos = getCoordinates(midAngle, labelRadius);
        const labelAngleDegrees = (midAngle * 180) / Math.PI + 90; // +90 to make text go along radius

        return (
          <g key={sector.id}>
            {/* Sector path */}
            <path
              d={createSectorPath(startAngle, endAngle, sector.level)}
              fill={getColor(index)}
              stroke="white"
              strokeWidth="2"
              opacity="0.8"
              className="transition-opacity hover:opacity-100 cursor-default"
            />

            {/* Sector label - rotated and positioned along radius */}
            <g transform={`translate(${labelPos.x},${labelPos.y}) rotate(${labelAngleDegrees})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-semibold pointer-events-none"
                fontSize="12"
                fill="#374151"
              >
                {sector.name}
              </text>
            </g>
          </g>
        );
      })}

      {/* Center point */}
      <circle cx={centerX} cy={centerY} r="3" fill="#6b7280" />
    </svg>
  );
}
