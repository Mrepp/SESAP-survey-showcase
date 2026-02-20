// https://observablehq.com/@observablehq/plot-correlation-heatmap
'use client'
import * as d3 from "d3"
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react"

// https://en.wikipedia.org/wiki/Correlation#Sample_correlation_coefficient
function corr(x, y) {
    const n = x.length;
    if (y.length !== n)
        throw new Error("The two columns must have the same length.");
    const x_ = d3.mean(x);
    const y_ = d3.mean(y);
    const XY = d3.sum(x, (_, i) => (x[i] - x_) * (y[i] - y_));
    const XX = d3.sum(x, (d) => (d - x_) ** 2);
    const YY = d3.sum(y, (d) => (d - y_) ** 2);
    return XY / Math.sqrt(XX * YY);
}

export default function Correlation({correlations}) {

    /*correlations = d3.cross(fields, fields).map(([a, b]) => ({
        a,
        b,
        correlation: corr(Plot.valueof(data, a), Plot.valueof(data, b))
    }))*/

   const chartRef = useRef(null)

    useEffect(() => {
        const plot = Plot.plot({
            marginLeft: 150,
            width: 800,
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
    }, [correlations])
    
    return <div ref={chartRef} />
}
