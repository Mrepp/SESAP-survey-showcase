// https://observablehq.com/@observablehq/plot-correlation-heatmap
'use client'
import * as d3 from "d3"
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react"

export const correlationHeatMapMeta = {
    title: "Correlation Heat Map",
    description:
        "Shows correlations between themes and identities. Blue and red show negative and positive relationships.",
}

export default function Correlation({ correlations, plotWidth = 800 }) {

   const chartRef = useRef(null)

    useEffect(() => {
        const plot = Plot.plot({
            marginLeft: 150,
            width: plotWidth,
            label: null,
            color: { scheme: "rdylbu", pivot: 0, legend: true, label: "correlation", width: '400', marginLeft: '15' },
            marks: [
                Plot.cell(correlations, { x: "a", y: "b", fill: "correlation" }),

                Plot.text(correlations, {
                    x: "a",
                    y: "b",
                    text: (d) => d.correlation.toFixed(2),
                    fill: (d) => (Math.abs(d.correlation) > 0.6 ? "white" : "black")
                })
            ]
        })

        chartRef.current.append(plot)
        return () => plot.remove()
    }, [correlations, plotWidth])
    
    return <div ref={chartRef} />
}
