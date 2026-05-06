'use client'
import * as d3 from "d3"
import { useMemo, useEffect, useRef, useState } from "react"

export const timelineMeta = {
    title: "Timeline",
    description: "Events from all interviews are anonymized and aggregated into one timeline. Events during college are highlighted green with a darker green corresponding to a higher density of events. Hover points to read each event.",
}

export default function Timeline ({
    data,
    width = 2000,
    height = 350,
    marginTop = 80,
    marginRight = 20,
    marginBottom = 90,
    marginLeft = 20
}) {
    const axisRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Function to determine x-axis scale and position of events
    const x = useMemo(() => {
        const numeric = data
            .map((d) => Number(d.point))
            .filter((v) => Number.isFinite(v));
        const [e0, e1] = numeric.length ? d3.extent(numeric) : [0, 1]; // endpoints
        const domainMin = Math.min(e0, 0) - 0.1; //covers for if endpoints fall inside [0,1] +- 0.1 for padding
        const domainMax = Math.max(e1, 1) + 0.1;
        return d3.scaleLinear([domainMin, domainMax], [marginLeft, width - marginRight]);
    }, [data, marginLeft, width, marginRight]);

    const axisY = height - marginBottom;
    const eventOffset = 30; // Base row: circle centers sit above the axis
    const stackSpacing = 20; // Vertical gap between stacked circles (radius 8)

    const stackLayerByIndex = useMemo(() => {
        const layer = new Array(data.length).fill(0);
        const nextSlot = new Map();
        data.forEach((d, i) => {
            const t = Number(d.point);
            const key = Number.isFinite(t) ? t : 0.5;
            const slot = nextSlot.get(key) ?? 0;
            layer[i] = slot;
            nextSlot.set(key, slot + 1);
        });
        return layer;
    }, [data]);

    // Create the green density backdrop
    const densityBins = useMemo(() => {
        const values = data
            .map((d) => Number(d.point))
            .filter((v) => Number.isFinite(v) && v >= 0 && v <= 1);
        const binCount = Math.min(
            48,
            Math.max(12, Math.round((x(1) - x(0)) / 10))
        );
        const thresholds = Array.from(
            { length: binCount - 1 },
            (_, i) => (i + 1) / binCount
        );
        const bins = d3
            .bin()
            .domain([0, 1])
            .thresholds(thresholds)(values);
        const maxLen = d3.max(bins, (b) => b.length) ?? 0;
        return bins.map((b, i) => {
            const px0 = x(b.x0);
            const px1 = x(b.x1);
            const norm = maxLen > 0 ? b.length / maxLen : 0;
            const t = 0.06 + norm * 0.94;
            return {
                key: i,
                x: px0,
                width: Math.max(1, px1 - px0),
                fill: d3.interpolateGreens(t),
            };
        });
    }, [data, x]);

    // Tick marks
    useEffect(() => {
        if (axisRef.current) {
            const g = d3.select(axisRef.current);
            const xAxis = d3.axisBottom(x).tickValues([0, 0.5, 1]);
            g.call(xAxis);
            g.selectAll('.tick text').remove();
            g.select('.domain').remove();
        }
    }, [x, width]);

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
            {/* Event density backdrop */}
            <g aria-label="Event density (0–1)">
                {densityBins.map((b) => (
                    <rect
                        key={b.key}
                        x={b.x}
                        y={0}
                        width={b.width}
                        height={axisY}
                        fill={b.fill}
                    />
                ))}
            </g>
            
            {/* Main horizontal timeline axis line */}
            <line
                x1={marginLeft}
                y1={axisY}
                x2={width - marginRight}
                y2={axisY}
                stroke="#333"
                strokeWidth="2"
            />
            
            {data.map((d, i) => {
                const t = Number(d.point);
                const xPos = x(Number.isFinite(t) ? t : 0.5);
                const yPos =
                    axisY - eventOffset - stackSpacing * stackLayerByIndex[i];

                return (
                    <circle
                        key={i}
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
                );
            })}
            
            {/* X-axis with labels */}
            <g ref={axisRef} transform={`translate(0, ${axisY})`} />

            {/* Labels */}
            <text
                x={(marginLeft + x(0)) / 2}
                y={axisY + 52}
                textAnchor="middle"
                dominantBaseline="hanging"
                style={{ fontSize: '18px', fontWeight: '500' }}
            >
                Pre-College
            </text>
            <text
                x={(x(0) + x(1)) / 2}
                y={axisY + 52}
                textAnchor="middle"
                dominantBaseline="hanging"
                style={{ fontSize: '18px', fontWeight: '500' }}
            >
                College
            </text>
            <text
                x={(x(1) + (width - marginRight)) / 2}
                y={axisY + 52}
                textAnchor="middle"
                dominantBaseline="hanging"
                style={{ fontSize: '18px', fontWeight: '500' }}
            >
                Post-College
            </text>
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