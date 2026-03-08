//https://observablehq.com/@d3/bubble-chart/2
'use client'
import * as d3 from "d3"
import { useEffect, useRef } from "react"

export default function BubbleChart({
    data,
    width = 800,
    height = width,
}) {
    const svgRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0) return

        // Specify the dimensions of the chart.
        const margin = 1; // to avoid clipping the root circle stroke
        const name = d => d.title
        const category = d => d.category
        const names = d => name(d).split(/(?=[A-Z][a-z])|\s+/g); // e.g. ["Identity", "&", "Discrimination"]

        // Specify the number format for values.
        const format = d3.format(",d")

        // Create a categorical color scale.
        const color = d3.scaleOrdinal(d3.schemeTableau10)

        // Create the pack layout.
        const pack = d3.pack()
            .size([width - margin * 2, height - margin * 2])
            .padding(3)

        // Compute the hierarchy from the (flat) data; expose the values
        // for each node; lastly apply the pack layout.
        const root = pack(d3.hierarchy({children: data})
            .sum(d => d.impactScore || d.value || 1));

        // Select the SVG container
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // Clear previous content and set attributes

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-margin, -margin, width, height])
            .attr("style", "max-width: 100%; height: auto; font-family: sans-serif;")
            .attr("text-anchor", "middle")

        const leaves = root.leaves()
        const rExtent = d3.extent(leaves, d => d.r)
        const fontSize = d3.scaleLinear()
            .domain([rExtent[0], rExtent[1]])
            .range([10, 40])
            .clamp(true)

        // Place each (leaf) node according to the layout's x and y values.
        // Set font-size on the group so label and value inherit (scaled by bubble radius).
        const node = svg.append("g")
            .selectAll()
            .data(leaves)
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .style("font-size", d => `${Math.round(fontSize(d.r))}px`)

        // Add a title.
        node.append("title")
            .text(d => `${d.data.title}\n${format(d.value)}`);

        // Add a filled circle.
        node.append("circle")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => color(category(d.data)))
            .attr("r", d => d.r);

        // Add a label (font size scales with bubble radius; inherited from group).
        const text = node.append("text")
            .attr("clip-path", d => `circle(${d.r})`)

        // Add a tspan for each word in the title.
        text.selectAll()
            .data(d => names(d.data))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
            .text(d => d)

        // Add a tspan for the node's value.
        text.append("tspan")
            .attr("x", 0)
            .attr("y", d => `${names(d.data).length / 2 + 0.35}em`)
            .attr("fill-opacity", 0.7)
            .text(d => format(d.value))

    }, [data, width, height])

    return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}