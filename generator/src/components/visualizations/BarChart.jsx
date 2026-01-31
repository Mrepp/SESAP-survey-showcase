'use client'
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

export default function BarChart () {

    return (
        Plot.plot({
            marginLeft: 90,
            marks: [
                Plot.barX(
                    themes,
                    Plot.groupY(
                        { x: "count" },
                        { fill: "frequency", y: "theme", sort: { y: "x", reverse: true } }
                    )
                )
            ]
        })
    )
}

const themes = [{theme: 'Academic Difficulty', impactScore: '1', frequency: '9'},
        {theme: 'Faculty Support', impactScore: '2', frequency: '8'},
        {theme: 'Peer Relationships', impactScore: '2', frequency: '7'},
        {theme: 'Belonging', impactScore: '3', frequency: '6'},
        {theme: 'Cultural Representation', impactScore: '4', frequency: '6'},
        {theme: 'Financial Struggles', impactScore: '5', frequency: '5'},
        {theme: 'Mental Health', impactScore: '5', frequency: '4'},
        {theme: 'Family Pressure', impactScore: '6', frequency: '3'},
        {theme: 'Work-Life Balance', impactScore: '1', frequency: '2'},
        {theme: 'Identity & Discrimination', impactScore: '2', frequency: '3'},
        {theme: 'Career Preparation', impactScore: '9', frequency: '4'},
        {theme: 'Language Barriers', impactScore: '8', frequency: '0'},
        {theme: 'Support Networks', impactScore: '8', frequency: '1'},
        {theme: 'Personal Growth', impactScore: '7', frequency: '2'},
]
