'use client'
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

export default function BarChart () {

    const containerRef = useRef();
    /*const [data, setData] = useState();

    useEffect(() => {
        d3.csv("/gistemp.csv", d3.autoType).then(setData);
    }, []);
*/
    useEffect(() => {
        if (data === undefined) return;
        
        // Transform nested data structure into flat array
        const flatData = data.flatMap(item => 
            Object.entries(item.themes).map(([theme, value]) => ({
                identity: item.identity,
                theme: theme,
                value: value
            }))
        );

        const plot = Plot.plot({
            marginLeft: 200,
            marginBottom: 50,
            marginRight: 120,
            width: 800,
            color: { scheme: "Dark2", columns: 1 },
            x: { label: "Value" },
            y: { label: "Identity" },
            marks: [
                Plot.barX(
                    flatData,
                    {
                        x: "value",
                        y: "identity",
                        fill: "theme",
                        sort: { y: "x", reverse: true }
                    }
                ),
                Plot.ruleX([0])
            ]
        });

        const legend = plot.legend('color')
        /*const legend = Plot.legend({
            color: {
                type: "categorical",
                scheme: "Dark2",
                columns: 1,
            },
            label: "Themes",
            
        })*/
        
        const d = d3.select(plot).append("foreignObject")
            .attr("width", 280)
            .attr("height", 200)
            .attr("x", 650)
            .attr("y", 120)
            .append("xhtml:div")
            .html(`
        <span style="font-family: sans-serif; font-size: 12px; font-weight: bold">
        Themes
        </span>` + legend.outerHTML);

        containerRef.current.append(plot);
        //return () => plot.remove();
        return plot
    }, []);

    return <div ref={containerRef} />;
}


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
