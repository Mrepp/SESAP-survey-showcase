//https://observablehq.com/@d3/bubble-chart/2
'use client'
import * as d3 from "d3"
import { useEffect, useRef } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'

export const bubbleChartMeta = {
    title: "Theme Bubble Chart",
    description:
        "Numbers represent the average theme frequency across all interviews. Larger bubbles correspond to more prominent themes.",
}

export default function BubbleChart({
    data,
    width = 800,
    height = width,
}) {
    const { data: d } = useDataLoader()

    const svgRef = useRef(null)

    const categories = d?.metadata?.categories ?? null

    useEffect(() => {
        if (!data || data.length === 0) return

        const margin = 1; // to avoid clipping the root circle stroke
        const name = d => (d.title || '').replace(/\d+$/, '').trim()
        const category = d => d.category
        const words = d => name(d).split(/(?=[A-Z][a-z])|\s+/g).filter(Boolean) // Split title into words (by spaces and CamelCase).


        // Specify the number format for values.
        const format = d3.format(",d")

        // Create a categorical color scale (domain matches legend keys when present).
        const color =
            categories?.length > 0
                ? d3.scaleOrdinal(d3.schemeTableau10).domain(categories)
                : d3.scaleOrdinal(d3.schemeTableau10)

        // Create the pack layout.
        const pack = d3.pack()
            .size([width - margin * 2, height - margin * 2])
            .padding(3)

        // Compute the hierarchy from the (flat) data; expose the values
        // for each node; lastly apply the pack layout.
        const root = pack(d3.hierarchy({children: data})
            .sum(d => d.impactScore || d.frequency));

        // Select the SVG container
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // Clear previous content and set attributes

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-margin, -margin, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;")
            .attr("text-anchor", "middle")

        const leaves = root.leaves()

        // Place each (leaf) node according to the layout’s x and y values.
        const node = svg.append("g")
            .selectAll()
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Add a title to hover
        node.append("title")
            .text(d => `${d.data.title}\n${format(d.value)}`);

        // Add a filled circle.
        node.append("circle")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => color(category(d.data)))
            .attr("r", d => d.r);

        // Add a label.
        const text = node.append("text")
            .attr("clip-path", d => `circle(${d.r})`);

        // Add a tspan for each CamelCase-separated word.
        text.selectAll()
            .data(d => words(d.data))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
            .text(d => d);

        // Add a tspan for the node’s value.
        text.append("tspan")
            .attr("x", 0)
            .attr("y", d => `${words(d.data).length / 2 + 0.35}em`)
            .attr("fill-opacity", 0.7)
            .text(d => format(d.value));

        // Categorical legend (loop + enter pattern): one circle + label per key
        // https://d3-graph-gallery.com/graph/custom_legend.html#cat2
        if (categories?.length > 0) {
            const legendX = 10
            const legendY = 20
            const rowStep = 25
            const dotR = 7
            const legendG = svg.append("g")
                .attr("class", "bubble-chart-legend")
                .attr("transform", `translate(${legendX},${legendY})`)
                .attr("text-anchor", "start")

            legendG.selectAll("circle")
                .data(categories)
                .join("circle")
                .attr("cx", 0)
                .attr("cy", (_, i) => i * rowStep)
                .attr("r", dotR)
                .attr("fill", d => color(d))

            legendG.selectAll("text")
                .data(categories)
                .join("text")
                .attr("x", dotR * 2 + 6)
                .attr("y", (_, i) => i * rowStep)
                .text(d => // remove underscores and hyphens; capitalize each word
                    d.replace(/[-_]+/g, " ")
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(" ")
                )
                .style("font-size", "12px")
                .style("alignment-baseline", "middle")
        }

    }, [data, width, height, categories])

    return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}