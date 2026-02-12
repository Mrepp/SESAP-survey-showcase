// https://observablehq.com/@observablehq/plot-correlation-heatmap
'use client'
import * as d3 from "d3"
import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react"

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

const correlations = [
  {a: "culmen_length_mm", b: "culmen_length_mm", correlation: 1},
  {a: "culmen_length_mm", b: "culmen_depth_mm", correlation: -0.2350528703555326},
  {a: "culmen_length_mm", b: "flipper_length_mm", correlation: 0.6561813407464275},
  {a: "culmen_length_mm", b: "body_mass_g", correlation: 0.5951098244376305},
  {a: "culmen_depth_mm", b: "culmen_length_mm", correlation: -0.2350528703555326},
  {a: "culmen_depth_mm", b: "culmen_depth_mm", correlation: 1},
  {a: "culmen_depth_mm", b: "flipper_length_mm", correlation: -0.5838512164654125},
  {a: "culmen_depth_mm", b: "body_mass_g", correlation: -0.4719156211860666},
  {a: "flipper_length_mm", b: "culmen_length_mm", correlation: 0.6561813407464275},
  {a: "flipper_length_mm", b: "culmen_depth_mm", correlation: -0.5838512164654125},
  {a: "flipper_length_mm", b: "flipper_length_mm", correlation: 1},
  {a: "flipper_length_mm", b: "body_mass_g", correlation: 0.8712017673060116},
  {a: "body_mass_g", b: "culmen_length_mm", correlation: 0.5951098244376305},
  {a: "body_mass_g", b: "culmen_depth_mm", correlation: -0.4719156211860666},
  {a: "body_mass_g", b: "flipper_length_mm", correlation: 0.8712017673060116},
  {a: "body_mass_g", b: "body_mass_g", correlation: 1},
]



export default function Correlation() {

    /*correlations = d3.cross(fields, fields).map(([a, b]) => ({
        a,
        b,
        correlation: corr(Plot.valueof(data, a), Plot.valueof(data, b))
    }))*/

   const corRef = useRef(null)

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

        corRef.current.append(plot)
        return () => plot.remove()
    }, [correlations])
    

    return <div ref={corRef} />

}

