// https://observablehq.com/@d3/word-cloud
'use client'
import * as d3 from "d3"
import d3Cloud from "d3-cloud"
import { useEffect, useMemo, useRef, useState } from "react"

// Tokens from a name/title string, using the same splitting as the cloud body text.
function tokensFromPersonField(s) {
    if (!s || typeof s !== "string") return []
    return s
        .split(/\W+/g)
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean)
}

// Lowercase tokens from each interview's title (interviewee) and metadata.interviewer.
function buildPersonNameStopSet(interviews) {
    const set = new Set()
    if (!Array.isArray(interviews)) return set
    for (const iv of interviews) {
        for (const t of tokensFromPersonField(iv?.title)) set.add(t)
        for (const t of tokensFromPersonField(iv?.metadata?.interviewer)) set.add(t)
    }
    return set
}

export const wordCloudMeta = {
    title: "Word Cloud",
    description:
        "Frequent terms from interview quotes and summaries. Larger words appear more often; common stopwords (e.g. articles, pronouns, conjunctions, etc.) are filtered out.",
}

export default function WordCloud({
    text,
    interviews, // optional: used to drop interviewee (title) and interviewer name tokens from the cloud
    size = group => group.length, // Given a grouping of words, returns the size factor for that word
    word = d => d, // Given an item of the data array, returns the word
    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    width, // outer width, in pixels (will be set from container if not provided)
    height, // outer height, in pixels (will be set from container if not provided)
    maxWords = 250, // maximum number of words to extract from the text
    fontFamily = "sans-serif", // font family
    fontScale = 20, // base font size
    fill = null, // text color, can be a constant or a function of the word
    padding = 3, // amount of padding between the words (in pixels)
    rotate = () => Math.floor(Math.random() * 2) * 90, // a constant or function to rotate the words
    invalidation // when this promise resolves, stop the simulation
    } = {}) {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const [stopwords, setStopwords] = useState(new Set())
    const [dimensions, setDimensions] = useState({ width: width || 800, height: height || 350 })
    const personNameStops = useMemo(() => buildPersonNameStopSet(interviews), [interviews])

    // Measure container and update dimensions
    useEffect(() => {
        if (!containerRef.current) return

        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth
                const containerHeight = containerRef.current.clientHeight
                
                // Only update if dimensions are provided via props, otherwise use container size
                const newWidth = width || containerWidth || 800
                const newHeight = height || containerHeight || 350
                
                setDimensions({ width: newWidth, height: newHeight })
            }
        }

        // Initial measurement
        updateDimensions()

        // Use ResizeObserver to track container size changes
        const resizeObserver = new ResizeObserver(updateDimensions)
        resizeObserver.observe(containerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [width, height])

    // Load stopwords from file
    useEffect(() => {
        async function loadStopwords() {
            try {
                const response = await fetch('/stopwords.txt')
                if (!response.ok) {
                    console.warn('Failed to load stopwords.txt, continuing without stopword filtering')
                    return
                }
                const text = await response.text()
                // Parse stopwords: split by newline, filter out comments and empty lines, trim whitespace
                const words = text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'))
                setStopwords(new Set(words))
            } catch (error) {
                console.warn('Error loading stopwords:', error)
            }
        }
        loadStopwords()
    }, [])

    useEffect(() => {
        if (!text) return
        if (!dimensions.width || !dimensions.height) return

        const words = typeof text === "string" ? text.split(/\W+/g) : Array.from(text);
        
        // Filter out stopwords (if stopwords haven't loaded yet, this will just filter empty strings)
        const filteredWords = words
            .map(w => w.toLowerCase().trim())
            .filter(w => w && !stopwords.has(w) && !personNameStops.has(w))
    
        const data = d3.rollups(filteredWords, size, w => w)
            .sort(([, a], [, b]) => d3.descending(a, b))
            .slice(0, maxWords)
            .map(([key, size]) => ({text: word(key), size}));
          
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // Clear previous content
            
        svg.attr("viewBox", [0, 0, dimensions.width, dimensions.height])
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("font-family", fontFamily)
            .attr("text-anchor", "middle")
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
        const g = svg.append("g").attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`);
      
        const cloud = d3Cloud()
            .size([dimensions.width - marginLeft - marginRight, dimensions.height - marginTop - marginBottom])
            .words(data)
            .padding(padding)
            .rotate(rotate)
            .font(fontFamily)
            .fontSize(d => Math.sqrt(d.size) * fontScale)
            .on("end", (words) => {
                g.selectAll("text")
                    .data(words)
                    .enter()
                    .append("text")
                    .style("font-size", d => `${d.size}px`)
                    .style("font-family", "Arial, sans-serif")
                    .style("fill", (d, i) => d3.schemeObservable10[i % 10])
                    .attr("text-anchor", "middle")
                    .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                    .text(d => d.text)
            })

        cloud.start();
        invalidation && invalidation.then(() => cloud.stop());
    }, [text, dimensions, stopwords, personNameStops, size, word, maxWords, fontFamily, fontScale, padding, rotate, marginTop, marginRight, marginBottom, marginLeft, invalidation])
    
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
        </div>
    )
}
