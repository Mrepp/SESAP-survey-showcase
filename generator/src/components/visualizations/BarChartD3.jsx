import * as d3 from "d3";
//import {Legend, Swatches} from "@d3/color-legend"
import {useEffect, useRef, useState} from "react";

const data = [{identity: 'Disabled', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'First-Generation', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Immigrant', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'International Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'LGBTQ+', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Low-Income', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 1, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Non-Traditional Age', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Parent', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Religious', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Rural', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'STEM Minoritized', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Student of Color', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Transfer Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Veteran', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},    
        {identity: 'Working Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
]

export default function BarChart () {
    const svgRef = useRef(null);
    
    useEffect(() => {
        if (!svgRef.current) return;
        
        // Clear any existing content
        d3.select(svgRef.current).selectAll("*").remove();
        
        // Specify the chart's dimensions (except for the height).
        const width = 800;
        const marginTop = 30;
        const marginRight = 10;
        const marginBottom = 0;
        const marginLeft = 175;

        // Get all unique theme keys from the data
        const themeKeys = d3.union(data.flatMap(d => Object.keys(d.themes)));

        // Transform data into format suitable for d3.stack
        // Each item has identity and all theme values as properties
        const transformedData = data.map(d => {
            const item = { identity: d.identity };
            Object.entries(d.themes).forEach(([key, value]) => {
                item[key] = value;
            });
            return item;
        });

        // Determine the series that need to be stacked.
        const series = d3.stack()
            .keys(themeKeys) // distinct theme keys, in input order
            .value((d, key) => d[key] || 0) // get value for each theme key and stack
            (transformedData);

        // Compute the height from the number of identities.
        const height = transformedData.length * 25 + marginTop + marginBottom;

        // Prepare the scales for positional and color encodings.
        const x = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleBand()
            .domain(transformedData.map(d => d.identity))
            .range([marginTop, height - marginBottom])
            .padding(0.08);

        const color = d3.scaleOrdinal()
            .domain(series.map(d => d.key))
            .range(d3.schemeObservable10)
            .unknown("#ccc");

        // A function to format the value in the tooltip.
        const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

        // Select the SVG container.
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // Append a group for each series, and a rect for each element in the series.
        svg.append("g")
            .selectAll()
            .data(series)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d.data.identity))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d[1]) - x(d[0]))
            .append("title")
            .text(d => `${d.data.identity} ${d.key}\n${formatValue(d[1] - d[0])}`);

        // Append the horizontal axis.
        svg.append("g")
            .attr("transform", `translate(0,${marginTop})`)
            .call(d3.axisTop(x).ticks(width / 100, "s"))
            .call(g => g.selectAll(".domain").remove());

        // Append the vertical axis.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .call(g => g.selectAll(".domain").remove());
    }, []);

    return <svg ref={svgRef}></svg>;
}
