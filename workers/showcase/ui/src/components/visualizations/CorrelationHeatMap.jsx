// https://observablehq.com/@observablehq/plot-correlation-heatmap
'use client'
import * as Plot from "@observablehq/plot"
import { useEffect, useRef } from "react"

export const correlationHeatMapMeta = {
    title: "Theme Correlation Heat Map",
    description:
        "Shows correlation among the top 15 themes by frequency across interviews (how often they appear together vs. apart). Red indicates themes that tend to co-occur; blue indicates themes that rarely appear on the same interview. The Pearson correlation coefficient is used to calculate the correlation.",
}

export default function Correlation({ correlations, plotWidth = 800 }) {
    const chartRef = useRef(null)

    useEffect(() => {
        if (!correlations?.length || !chartRef.current) return

        const labels = [...new Set(correlations.map((d) => d.a))]
        const n = labels.length
        const maxLen = Math.max(8, ...labels.map((s) => s.length))
        const marginLeft = Math.min(300, 48 + maxLen * 5.2)
        const marginBottom = Math.min(280, 40 + maxLen * 3.2)
        const marginTop = 28
        const marginRight = 50
        const innerW = plotWidth - marginLeft - marginRight
        const cell = n > 0 ? Math.max(10, Math.min(22, innerW / n)) : 16
        const height = marginTop + marginBottom + n * cell

        const plot = Plot.plot({
            width: plotWidth,
            height,
            marginTop,
            marginLeft,
            marginRight,
            marginBottom,
            label: null,
            x: { tickRotate: 50, tickSize: 0 },
            y: { tickSize: 0 },
            style: {
                overflow: "visible",
            },
            color: {
                scheme: "rdylbu",
                pivot: 0,
                legend: true,
                label: "correlation",
                width: "300",
                marginLeft: "15",
            },
            marks: [
                Plot.cell(correlations, { x: "a", y: "b", fill: "correlation" }),
                Plot.text(correlations, {
                    x: "a",
                    y: "b",
                    text: (d) => {
                        const v = d.correlation
                        return Number.isFinite(v) ? v.toFixed(2) : "—"
                    },
                    fill: (d) =>
                        Number.isFinite(d.correlation) && Math.abs(d.correlation) > 0.55
                            ? "white"
                            : "black",
                    fontSize: n > 20 ? 7 : 9,
                }),
            ],
        })

        chartRef.current.append(plot)
        return () => plot.remove()
    }, [correlations, plotWidth])

    return (
        <div
            ref={chartRef}
            style={{
                overflow: "hidden",
                maxWidth: "100%",
                paddingBottom: "40px",
                paddingLeft: "10px",
                paddingRight: "10px",
            }}
        />
    )
}
