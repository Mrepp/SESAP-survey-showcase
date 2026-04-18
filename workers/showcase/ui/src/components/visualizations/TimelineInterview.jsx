'use client'
import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"

export const timelineInterviewMeta = {
    title: "Interview Class-Standing Timeline",
    description:
        "Timeline of interview events across class years (freshman–senior). Hover markers for the event and its significance.",
}

export default function Timeline ({
    data,
    width = 640,
    height = 200,
    marginTop = 80,
    marginRight = 20,
    marginBottom = 90,
    marginLeft = 20
}) {
    const axisRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    
    // Convert years to Date objects and extract extent
    const years = ['freshman', 'sophomore', 'junior', 'senior']
    const yearExtent = d3.extent(years);
    
    // Create time scale for x-axis
    const x = d3.scaleTime(yearExtent, [marginLeft, width - marginRight]);
    
    // Calculate y positions - alternate above and below axis
    const axisY = height - marginBottom;
    const eventOffset = 60; // Distance from axis for events

    // Chevron axis: segment layout and colors
    const axisColors = ['#FAAB8E', '#F88A62', '#F76A36', '#D73F09'];
    const axisHeight = 50;
    const axisNotch = 10;
    const axisGap = 2;
    const axisInnerWidth = width - marginRight - marginLeft;
    const segmentCount = years.length;
    const segmentWidth = (axisInnerWidth - (segmentCount - 1) * axisGap) / segmentCount;

    const chevronSegments = years.map((label, i) => {
        const left = marginLeft + i * (segmentWidth + axisGap);
        const right = left + segmentWidth;
        const top = axisY - axisHeight / 2;
        const bottom = axisY + axisHeight / 2;
        const color = axisColors[i % axisColors.length];
        const pathD = [
            `M ${left} ${top}`,
            `L ${left + axisNotch} ${axisY}`,
            `L ${left} ${bottom}`,
            `L ${right - axisNotch} ${bottom}`,
            `L ${right} ${axisY}`,
            `L ${right - axisNotch} ${top}`,
            'Z'
        ].join(' ');
        return { pathD, color, label, cx: (left + right) / 2, cy: axisY, left, right };
    });

    // Map period string to segment index (Freshman=0, Sophomore=1, Junior=2, Senior=3)
    const getPeriodIndex = (periodStr) => {
        const p = String(periodStr).toLowerCase();
        if (p.includes('freshman')) return 0;
        if (p.includes('sophomore')) return 1;
        if (p.includes('junior')) return 2;
        if (p.includes('senior')) return 3;
        return 0;
    };

    // Assign each event an x position evenly spaced within its segment
    const eventPositions = (() => {
        const bySegment = [...Array(segmentCount)].map(() => []);
        data.forEach((d, i) => {
            const segIdx = getPeriodIndex(d.period);
            bySegment[segIdx].push(i);
        });
        const positions = [];
        bySegment.forEach((indices, segIdx) => {
            const seg = chevronSegments[segIdx];
            const n = indices.length;
            indices.forEach((dataIndex, j) => {
                const xPos = n <= 1
                    ? seg.cx
                    : seg.left + (seg.right - seg.left) * (j + 0.5) / n;
                positions[dataIndex] = xPos;
            });
        });
        return positions;
    })();

    const handleMouseEnter = (e, i) => {
        setHoveredIndex(i);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (hoveredIndex !== null) {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    return (
        <>
        <svg width={width} height={height}>
            {/* Vertical lines and circles for each event */}
            {data.map((d, i) => {
                const xPos = eventPositions[i] ?? chevronSegments[getPeriodIndex(d.period)].cx;
                // Alternate: even indices below, odd indices above
                const yPos = axisY + (i % 2 === 0 ? eventOffset : -eventOffset);
                
                return (
                    <g key={i}>
                        {/* Vertical line connecting event to axis */}
                        <line
                            x1={xPos}
                            y1={axisY}
                            x2={xPos}
                            y2={yPos}
                            stroke="#333"
                            strokeWidth="1"
                        />
                        {/* Event circle */}
                        <circle
                            cx={xPos}
                            cy={yPos}
                            r="8"
                            fill="white"
                            stroke="#333"
                            strokeWidth="1"
                            onMouseEnter={(e) => handleMouseEnter(e, i)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ cursor: 'pointer' }}
                        />
                    </g>
                );
            })}

            {/* Chevron-style timeline axis: interlocking segments with labels */}
            <g aria-label="Timeline axis">
                {chevronSegments.map((seg, i) => (
                    <g key={i}>
                        <path
                            d={seg.pathD}
                            fill={seg.color}
                        />
                        <text
                            x={seg.cx}
                            y={seg.cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="black"
                            fontSize="12"
                            fontWeight="600"
                        >
                            {seg.label.charAt(0).toUpperCase() + seg.label.slice(1)}
                        </text>
                    </g>
                ))}
            </g>

            {/* X-axis with labels */}
            <g ref={axisRef} transform={`translate(0, ${axisY})`} />
        </svg>
        
        {/* Tooltip */}
        {hoveredIndex !== null && (
            <div
                style={{
                    position: 'fixed',
                    left: `${tooltipPosition.x + 10}px`,
                    top: `${tooltipPosition.y - 10}px`,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    maxWidth: '300px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
            >
                {data[hoveredIndex].event}
            </div>
        )}
        </>
    )
}