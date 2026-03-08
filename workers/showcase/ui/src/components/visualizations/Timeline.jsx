'use client'
import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"


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
    const years = data.map(d => new Date(d.year, 0, 1));
    const yearExtent = d3.extent(years);
    
    // Create time scale for x-axis
    const x = d3.scaleTime(yearExtent, [marginLeft, width - marginRight]);
    
    // Calculate y positions - alternate above and below axis
    const axisY = height - marginBottom;
    const eventOffset = 60; // Distance from axis for events
    
    useEffect(() => {
        if (axisRef.current) {
            const xAxis = d3.axisBottom(x);
            d3.select(axisRef.current).call(xAxis);
        }
    }, [x]);

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
            {/* Main horizontal timeline axis line */}
            <line
                x1={marginLeft}
                y1={axisY}
                x2={width - marginRight}
                y2={axisY}
                stroke="#333"
                strokeWidth="2"
            />
            
            {/* Vertical lines and circles for each event */}
            {data.map((d, i) => {
                const xPos = x(new Date(d.year, 0, 1));
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