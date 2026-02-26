(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/visualizations/BarChart.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-chartjs-2/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CategoryScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LinearScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BarElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Title"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Tooltip"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Legend"]);
// Generate colors for each theme
const generateColors = (count)=>{
    const colors = [
        'rgb(255, 99, 132)',
        'rgb(75, 192, 192)',
        'rgb(53, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(199, 199, 199)',
        'rgb(83, 102, 255)',
        'rgb(255, 99, 255)',
        'rgb(99, 255, 132)',
        'rgb(255, 132, 99)',
        'rgb(132, 99, 255)',
        'rgb(99, 255, 255)',
        'rgb(255, 255, 99)'
    ];
    // Cycle through colors if we have more themes than colors
    return Array.from({
        length: count
    }, (_, i)=>colors[i % colors.length]);
};
const options = {
    indexAxis: 'y',
    plugins: {
        title: {
            display: true,
            text: 'Theme Frequency by Identity'
        },
        legend: {
            position: 'right'
        }
    },
    responsive: true,
    scales: {
        x: {
            stacked: true
        },
        y: {
            stacked: true
        }
    }
};
// Hardcoded labels as fallback in case identities.txt fails to load
const fallbackLabels = [
    'Disabled',
    'First-Generation',
    'Immigrant',
    'International Student',
    'LGBTQ+',
    'Low-Income',
    'Non-Traditional Age',
    'Parent',
    'Religious',
    'Rural',
    'STEM Minoritized',
    'Student of Color',
    'Transfer Student',
    'Veteran',
    'Working Student'
];
function BarChart({ interviewData }) {
    _s();
    const [labels, setLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(fallbackLabels);
    const [chartData, setChartData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const themeColors = generateColors(interviewData.length);
    // Load identities from identities.txt
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BarChart.useEffect": ()=>{
            async function loadIdentities() {
                try {
                    const response = await fetch('/identities.txt');
                    if (!response.ok) {
                        console.warn('Failed to load identities.txt, using fallback labels');
                        setLabels(fallbackLabels);
                        return;
                    }
                    const text = await response.text();
                    // Parse identities: split by newline, trim whitespace, filter out empty lines and comments
                    const identities = text.split('\n').map({
                        "BarChart.useEffect.loadIdentities.identities": (line)=>line.trim()
                    }["BarChart.useEffect.loadIdentities.identities"]).filter({
                        "BarChart.useEffect.loadIdentities.identities": (line)=>line && !line.startsWith('#')
                    }["BarChart.useEffect.loadIdentities.identities"]);
                    if (identities.length > 0) {
                        setLabels(identities);
                    } else {
                        console.warn('identities.txt is empty, using fallback labels');
                        setLabels(fallbackLabels);
                    }
                } catch (error) {
                    console.warn('Error loading identities.txt:', error);
                    setLabels(fallbackLabels);
                }
            }
            loadIdentities();
        }
    }["BarChart.useEffect"], []);
    // Update chart data when labels are loaded
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BarChart.useEffect": ()=>{
            if (labels.length > 0) {
                setChartData({
                    labels,
                    datasets: interviewData.map({
                        "BarChart.useEffect": (item, index)=>({
                                label: item.theme,
                                // Map over labels to get values in the correct order
                                data: labels.map({
                                    "BarChart.useEffect": (label)=>item.identities[label] || 0
                                }["BarChart.useEffect"]),
                                backgroundColor: themeColors[index]
                            })
                    }["BarChart.useEffect"])
                });
            }
        }
    }["BarChart.useEffect"], [
        labels
    ]);
    if (!chartData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Loading chart..."
        }, void 0, false, {
            fileName: "[project]/src/components/visualizations/BarChart.jsx",
            lineNumber: 123,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
        options: options,
        data: chartData
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/BarChart.jsx",
        lineNumber: 126,
        columnNumber: 12
    }, this);
} // https://react-chartjs-2.js.org/components/bar
 // https://react-chartjs-2.js.org/examples/stacked-bar-chart
_s(BarChart, "Qwa8JU+xd7BAuJH+j7ZO2p41kiE=");
_c = BarChart;
var _c;
__turbopack_context__.k.register(_c, "BarChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/visualizations/BubbleChart.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//https://observablehq.com/@d3/bubble-chart/2
__turbopack_context__.s([
    "default",
    ()=>BubbleChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-format/src/defaultLocale.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$ordinal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleOrdinal$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/ordinal.js [app-client] (ecmascript) <export default as scaleOrdinal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale-chromatic/src/categorical/Tableau10.js [app-client] (ecmascript) <export default as schemeTableau10>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$hierarchy$2f$src$2f$pack$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pack$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-hierarchy/src/pack/index.js [app-client] (ecmascript) <export default as pack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$hierarchy$2f$src$2f$hierarchy$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__hierarchy$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-hierarchy/src/hierarchy/index.js [app-client] (ecmascript) <export default as hierarchy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-client] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/extent.js [app-client] (ecmascript) <export default as extent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/linear.js [app-client] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function BubbleChart({ data, width = 800, height = width }) {
    _s();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BubbleChart.useEffect": ()=>{
            if (!data || data.length === 0) return;
            // Specify the dimensions of the chart.
            const margin = 1; // to avoid clipping the root circle stroke
            const name = {
                "BubbleChart.useEffect.name": (d)=>d.title
            }["BubbleChart.useEffect.name"];
            const category = {
                "BubbleChart.useEffect.category": (d)=>d.category
            }["BubbleChart.useEffect.category"];
            const names = {
                "BubbleChart.useEffect.names": (d)=>name(d).split(/(?=[A-Z][a-z])|\s+/g)
            }["BubbleChart.useEffect.names"]; // e.g. ["Identity", "&", "Discrimination"]
            // Specify the number format for values.
            const format = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["format"](",d");
            // Create a categorical color scale.
            const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$ordinal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleOrdinal$3e$__["scaleOrdinal"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__["schemeTableau10"]);
            // Create the pack layout.
            const pack = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$hierarchy$2f$src$2f$pack$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pack$3e$__["pack"]().size([
                width - margin * 2,
                height - margin * 2
            ]).padding(3);
            // Compute the hierarchy from the (flat) data; expose the values
            // for each node; lastly apply the pack layout.
            const root = pack(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$hierarchy$2f$src$2f$hierarchy$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__hierarchy$3e$__["hierarchy"]({
                children: data
            }).sum({
                "BubbleChart.useEffect.root": (d)=>d.impactScore || d.value || 1
            }["BubbleChart.useEffect.root"]));
            // Select the SVG container
            const svg = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"](svgRef.current);
            svg.selectAll("*").remove(); // Clear previous content and set attributes
            svg.attr("width", width).attr("height", height).attr("viewBox", [
                -margin,
                -margin,
                width,
                height
            ]).attr("style", "max-width: 100%; height: auto; font-family: sans-serif;").attr("text-anchor", "middle");
            const leaves = root.leaves();
            const rExtent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"](leaves, {
                "BubbleChart.useEffect.rExtent": (d)=>d.r
            }["BubbleChart.useEffect.rExtent"]);
            const fontSize = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"]().domain([
                rExtent[0],
                rExtent[1]
            ]).range([
                10,
                40
            ]).clamp(true);
            // Place each (leaf) node according to the layout's x and y values.
            // Set font-size on the group so label and value inherit (scaled by bubble radius).
            const node = svg.append("g").selectAll().data(leaves).join("g").attr("transform", {
                "BubbleChart.useEffect.node": (d)=>`translate(${d.x},${d.y})`
            }["BubbleChart.useEffect.node"]).style("font-size", {
                "BubbleChart.useEffect.node": (d)=>`${Math.round(fontSize(d.r))}px`
            }["BubbleChart.useEffect.node"]);
            // Add a title.
            node.append("title").text({
                "BubbleChart.useEffect": (d)=>`${d.data.title}\n${format(d.value)}`
            }["BubbleChart.useEffect"]);
            // Add a filled circle.
            node.append("circle").attr("fill-opacity", 0.7).attr("fill", {
                "BubbleChart.useEffect": (d)=>color(category(d.data))
            }["BubbleChart.useEffect"]).attr("r", {
                "BubbleChart.useEffect": (d)=>d.r
            }["BubbleChart.useEffect"]);
            // Add a label (font size scales with bubble radius; inherited from group).
            const text = node.append("text").attr("clip-path", {
                "BubbleChart.useEffect.text": (d)=>`circle(${d.r})`
            }["BubbleChart.useEffect.text"]);
            // Add a tspan for each word in the title.
            text.selectAll().data({
                "BubbleChart.useEffect": (d)=>names(d.data)
            }["BubbleChart.useEffect"]).join("tspan").attr("x", 0).attr("y", {
                "BubbleChart.useEffect": (d, i, nodes)=>`${i - nodes.length / 2 + 0.35}em`
            }["BubbleChart.useEffect"]).text({
                "BubbleChart.useEffect": (d)=>d
            }["BubbleChart.useEffect"]);
            // Add a tspan for the node's value.
            text.append("tspan").attr("x", 0).attr("y", {
                "BubbleChart.useEffect": (d)=>`${names(d.data).length / 2 + 0.35}em`
            }["BubbleChart.useEffect"]).attr("fill-opacity", 0.7).text({
                "BubbleChart.useEffect": (d)=>format(d.value)
            }["BubbleChart.useEffect"]);
        }
    }["BubbleChart.useEffect"], [
        data,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        ref: svgRef,
        style: {
            width: '100%',
            height: '100%'
        }
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/BubbleChart.jsx",
        lineNumber: 95,
        columnNumber: 12
    }, this);
}
_s(BubbleChart, "89Ty783ABEwsfMbSOeu9vscWF34=");
_c = BubbleChart;
var _c;
__turbopack_context__.k.register(_c, "BubbleChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/visualizations/CorrelationHeatMap.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// https://observablehq.com/@observablehq/plot-correlation-heatmap
__turbopack_context__.s([
    "default",
    ()=>Correlation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$mean$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__mean$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/mean.js [app-client] (ecmascript) <export default as mean>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$sum$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__sum$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/sum.js [app-client] (ecmascript) <export default as sum>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$plot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/plot.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/marks/cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/marks/text.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// https://en.wikipedia.org/wiki/Correlation#Sample_correlation_coefficient
function corr(x, y) {
    const n = x.length;
    if (y.length !== n) throw new Error("The two columns must have the same length.");
    const x_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$mean$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__mean$3e$__["mean"](x);
    const y_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$mean$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__mean$3e$__["mean"](y);
    const XY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$sum$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__sum$3e$__["sum"](x, (_, i)=>(x[i] - x_) * (y[i] - y_));
    const XX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$sum$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__sum$3e$__["sum"](x, (d)=>(d - x_) ** 2);
    const YY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$sum$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__sum$3e$__["sum"](y, (d)=>(d - y_) ** 2);
    return XY / Math.sqrt(XX * YY);
}
function Correlation({ correlations }) {
    _s();
    /*correlations = d3.cross(fields, fields).map(([a, b]) => ({
        a,
        b,
        correlation: corr(Plot.valueof(data, a), Plot.valueof(data, b))
    }))*/ const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Correlation.useEffect": ()=>{
            const plot = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$plot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["plot"]({
                marginLeft: 150,
                width: 800,
                label: null,
                color: {
                    scheme: "rdylbu",
                    pivot: 0,
                    legend: true,
                    label: "correlation",
                    width: '400',
                    marginLeft: '15'
                },
                marks: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cell"](correlations, {
                        x: "a",
                        y: "b",
                        fill: "correlation"
                    }),
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["text"](correlations, {
                        x: "a",
                        y: "b",
                        text: {
                            "Correlation.useEffect.plot": (d)=>d.correlation.toFixed(2)
                        }["Correlation.useEffect.plot"],
                        fill: {
                            "Correlation.useEffect.plot": (d)=>Math.abs(d.correlation) > 0.6 ? "white" : "black"
                        }["Correlation.useEffect.plot"]
                    })
                ]
            });
            chartRef.current.append(plot);
            return ({
                "Correlation.useEffect": ()=>plot.remove()
            })["Correlation.useEffect"];
        }
    }["Correlation.useEffect"], [
        correlations
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: chartRef
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/CorrelationHeatMap.jsx",
        lineNumber: 52,
        columnNumber: 12
    }, this);
}
_s(Correlation, "X+1SfQQ6xefXNU27aQW843M7cTw=");
_c = Correlation;
var _c;
__turbopack_context__.k.register(_c, "Correlation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/visualizations/WordCloud.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// https://observablehq.com/@d3/word-cloud
__turbopack_context__.s([
    "default",
    ()=>WordCloud
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$group$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/group.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$descending$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__descending$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/descending.js [app-client] (ecmascript) <export default as descending>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-client] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$observable10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeObservable10$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale-chromatic/src/categorical/observable10.js [app-client] (ecmascript) <export default as schemeObservable10>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$cloud$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-cloud/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function WordCloud({ text, size = (group)=>group.length, word = (d)=>d, marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0, width, height, maxWords = 250, fontFamily = "sans-serif", fontScale = 20, fill = null, padding = 3, rotate = ()=>Math.floor(Math.random() * 2) * 90, invalidation// when this promise resolves, stop the simulation
 } = {}) {
    _s();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [stopwords, setStopwords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [dimensions, setDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: width || 800,
        height: height || 350
    });
    // Measure container and update dimensions
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordCloud.useEffect": ()=>{
            if (!containerRef.current) return;
            const updateDimensions = {
                "WordCloud.useEffect.updateDimensions": ()=>{
                    if (containerRef.current) {
                        const containerWidth = containerRef.current.clientWidth;
                        const containerHeight = containerRef.current.clientHeight;
                        // Only update if dimensions are provided via props, otherwise use container size
                        const newWidth = width || containerWidth || 800;
                        const newHeight = height || containerHeight || 350;
                        setDimensions({
                            width: newWidth,
                            height: newHeight
                        });
                    }
                }
            }["WordCloud.useEffect.updateDimensions"];
            // Initial measurement
            updateDimensions();
            // Use ResizeObserver to track container size changes
            const resizeObserver = new ResizeObserver(updateDimensions);
            resizeObserver.observe(containerRef.current);
            return ({
                "WordCloud.useEffect": ()=>{
                    resizeObserver.disconnect();
                }
            })["WordCloud.useEffect"];
        }
    }["WordCloud.useEffect"], [
        width,
        height
    ]);
    // Load stopwords from file
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordCloud.useEffect": ()=>{
            async function loadStopwords() {
                try {
                    const response = await fetch('/stopwords.txt');
                    if (!response.ok) {
                        console.warn('Failed to load stopwords.txt, continuing without stopword filtering');
                        return;
                    }
                    const text = await response.text();
                    // Parse stopwords: split by newline, filter out comments and empty lines, trim whitespace
                    const words = text.split('\n').map({
                        "WordCloud.useEffect.loadStopwords.words": (line)=>line.trim()
                    }["WordCloud.useEffect.loadStopwords.words"]).filter({
                        "WordCloud.useEffect.loadStopwords.words": (line)=>line && !line.startsWith('#')
                    }["WordCloud.useEffect.loadStopwords.words"]);
                    setStopwords(new Set(words));
                } catch (error) {
                    console.warn('Error loading stopwords:', error);
                }
            }
            loadStopwords();
        }
    }["WordCloud.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordCloud.useEffect": ()=>{
            if (!text) return;
            if (!dimensions.width || !dimensions.height) return;
            const words = typeof text === "string" ? text.split(/\W+/g) : Array.from(text);
            // Filter out stopwords (if stopwords haven't loaded yet, this will just filter empty strings)
            const filteredWords = words.map({
                "WordCloud.useEffect.filteredWords": (w)=>w.toLowerCase().trim()
            }["WordCloud.useEffect.filteredWords"]).filter({
                "WordCloud.useEffect.filteredWords": (w)=>w && !stopwords.has(w)
            }["WordCloud.useEffect.filteredWords"]);
            const data = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$group$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollups"](filteredWords, size, {
                "WordCloud.useEffect.data": (w)=>w
            }["WordCloud.useEffect.data"]).sort({
                "WordCloud.useEffect.data": ([, a], [, b])=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$descending$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__descending$3e$__["descending"](a, b)
            }["WordCloud.useEffect.data"]).slice(0, maxWords).map({
                "WordCloud.useEffect.data": ([key, size])=>({
                        text: word(key),
                        size
                    })
            }["WordCloud.useEffect.data"]);
            const svg = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"](svgRef.current);
            svg.selectAll("*").remove(); // Clear previous content
            svg.attr("viewBox", [
                0,
                0,
                dimensions.width,
                dimensions.height
            ]).attr("width", dimensions.width).attr("height", dimensions.height).attr("font-family", fontFamily).attr("text-anchor", "middle").attr("style", "max-width: 100%; height: auto; height: intrinsic;");
            const g = svg.append("g").attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`);
            const cloud = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$cloud$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().size([
                dimensions.width - marginLeft - marginRight,
                dimensions.height - marginTop - marginBottom
            ]).words(data).padding(padding).rotate(rotate).font(fontFamily).fontSize({
                "WordCloud.useEffect.cloud": (d)=>Math.sqrt(d.size) * fontScale
            }["WordCloud.useEffect.cloud"]).on("end", {
                "WordCloud.useEffect.cloud": (words)=>{
                    g.selectAll("text").data(words).enter().append("text").style("font-size", {
                        "WordCloud.useEffect.cloud": (d)=>`${d.size}px`
                    }["WordCloud.useEffect.cloud"]).style("font-family", "Arial, sans-serif").style("fill", {
                        "WordCloud.useEffect.cloud": (d, i)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$observable10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeObservable10$3e$__["schemeObservable10"][i % 10]
                    }["WordCloud.useEffect.cloud"]).attr("text-anchor", "middle").attr("transform", {
                        "WordCloud.useEffect.cloud": (d)=>`translate(${d.x},${d.y})rotate(${d.rotate})`
                    }["WordCloud.useEffect.cloud"]).text({
                        "WordCloud.useEffect.cloud": (d)=>d.text
                    }["WordCloud.useEffect.cloud"]);
                }
            }["WordCloud.useEffect.cloud"]);
            cloud.start();
            invalidation && invalidation.then({
                "WordCloud.useEffect": ()=>cloud.stop()
            }["WordCloud.useEffect"]);
        }
    }["WordCloud.useEffect"], [
        text,
        dimensions,
        stopwords,
        size,
        word,
        maxWords,
        fontFamily,
        fontScale,
        padding,
        rotate,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        invalidation
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        style: {
            width: '100%',
            height: '100%'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            ref: svgRef,
            style: {
                width: '100%',
                height: '100%'
            }
        }, void 0, false, {
            fileName: "[project]/src/components/visualizations/WordCloud.jsx",
            lineNumber: 136,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/WordCloud.jsx",
        lineNumber: 135,
        columnNumber: 9
    }, this);
}
_s(WordCloud, "jFRegdVmWkpNRkjXXEseTGz+PpI=");
_c = WordCloud;
var _c;
__turbopack_context__.k.register(_c, "WordCloud");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/insights/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Insights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@chakra-ui/react/dist/esm/components/box/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$stack$2f$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@chakra-ui/react/dist/esm/components/stack/stack.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BarChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/BarChart.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BubbleChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/BubbleChart.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$CorrelationHeatMap$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/CorrelationHeatMap.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$WordCloud$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/WordCloud.jsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
function Insights() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$stack$2f$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stack"], {
            direction: {
                base: "column",
                md: "row"
            },
            h: "100vh",
            gap: "20px",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$stack$2f$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stack"], {
                    w: "40%",
                    h: "100%",
                    gap: "20px",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            bg: "white",
                            w: "100%",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$WordCloud$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                text: text
                            }, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 24,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 23,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            bg: "white",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            p: "15px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BubbleChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                data: themes
                            }, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 28,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 27,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 22,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$stack$2f$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stack"], {
                    h: "100%",
                    gap: "20px",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            w: "fit-content",
                            h: "fit-content",
                            bg: "white",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            paddingLeft: "20px",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$CorrelationHeatMap$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                correlations: correlations
                            }, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 34,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 33,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            minH: "300px",
                            h: "fit-content",
                            bg: "white",
                            padding: "20px",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BarChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                interviewData: interviewData
                            }, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 38,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 37,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 32,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/insights/page.jsx",
            lineNumber: 21,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_c = Insights;
const themes = [
    {
        "title": "Academic Difficulty",
        "impactScore": 10,
        "category": "cat3"
    },
    {
        "title": "Belonging",
        "impactScore": 5,
        "category": "cat2"
    },
    {
        "title": "Career Preparation",
        "impactScore": 7,
        "category": "cat1"
    },
    {
        "title": "Cultural Representation",
        "impactScore": 8,
        "category": "cat2"
    },
    {
        "title": "Faculty Support",
        "impactScore": 10,
        "category": "cat1"
    },
    {
        "title": "Family Pressure",
        "impactScore": 5,
        "category": "cat2"
    },
    {
        "title": "Financial Struggles",
        "impactScore": 7,
        "category": "cat1"
    },
    {
        "title": "Identity & Discrimination",
        "impactScore": 1,
        "category": "cat2"
    },
    {
        "title": "Mental Health",
        "impactScore": 10,
        "category": "cat1"
    },
    {
        "title": "Language Barriers",
        "impactScore": 5,
        "category": "cat2"
    },
    {
        "title": "Peer Relationships",
        "impactScore": 3,
        "category": "cat1"
    },
    {
        "title": "Personal Growth",
        "impactScore": 7,
        "category": "cat2"
    },
    {
        "title": "Support Networks",
        "impactScore": 2,
        "category": "cat1"
    },
    {
        "title": "Work-Life Balance",
        "impactScore": 1,
        "category": "cat3"
    }
];
const text = `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole,
filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy
hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and
that means comfort.
It had a perfectly round door like a porthole, painted green, with a
shiny yellow brass knob in the exact middle. The door opened on to a tube-
shaped hall like a tunnel: a very comfortable tunnel without smoke, with
panelled walls, and floors tiled and carpeted, provided with polished
chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of
visitors. The tunnel wound on and on, going fairly but not quite straight
into the side of the hill—The Hill, as all the people for many miles round
called it—and many little round doors opened out of it, first on one side
and then on another. No going upstairs for the hobbit: bedrooms,
bathrooms, cellars, pantries (lots of these), wardrobes (he had whole
rooms devoted to clothes), kitchens, dining-rooms, all were on the same
floor, and indeed on the same passage. The best rooms were all on the left-
hand side (going in), for these were the only ones to have windows, deep-
set round windows looking over his garden, and meadows beyond, sloping
down to the river.
This hobbit was a very well-to-do hobbit, and his name was Baggins.
The Bagginses had lived in the neighbourhood of The Hill for time out of
mind, and people considered them very respectable, not only because most
of them were rich, but also because they never had any adventures or did
anything unexpected: you could tell what a Baggins would say on any
question without the bother of asking him. This is a story of how a
Baggins had an adventure, and found himself doing and saying things
altogether unexpected. He may have lost the neighbours’ respect, but he
gained—well, you will see whether he gained anything in the end.
The mother of our particular hobbit—what is a hobbit? I suppose
hobbits need some description nowadays, since they have become rare and
shy of the Big People, as they call us. They are (or were) a little people,
about half our height, and smaller than the bearded Dwarves. Hobbits have
no beards. There is little or no magic about them, except the ordinary
everyday sort which helps them to disappear quietly and quickly when
large stupid folk like you and me come blundering along, making a noise
like elephants which they can hear a mile off. They are inclined to be fat in
the stomach; they dress in bright colours (chiefly green and yellow); wear
no shoes, because their feet grow natural leathery soles and thick warm
brown hair like the stuff on their heads (which is curly); have long clever
brown fingers, good-natured faces, and laugh deep fruity laughs
(especially after dinner, which they have twice a day when they can get it).
Now you know enough to go on with. As I was saying, the mother of this
hobbit—of Bilbo Baggins, that is—was the famous Belladonna Took, one
of the three remarkable daughters of the Old Took, head of the hobbits who
lived across The Water, the small river that ran at the foot of The Hill. It
was often said (in other families) that long ago one of the Took ancestors
must have taken a fairy wife. That was, of course, absurd, but certainly
there was still something not entirely hobbitlike about them, and once in a
while members of the Took-clan would go and have adventures. They
discreetly disappeared, and the family hushed it up; but the fact remained
that the Tooks were not as respectable as the Bagginses, though they were
undoubtedly richer.`;
const correlations = [
    {
        a: "culmen_length_mm",
        b: "culmen_length_mm",
        correlation: 1
    },
    {
        a: "culmen_length_mm",
        b: "culmen_depth_mm",
        correlation: -0.2350528703555326
    },
    {
        a: "culmen_length_mm",
        b: "flipper_length_mm",
        correlation: 0.6561813407464275
    },
    {
        a: "culmen_length_mm",
        b: "body_mass_g",
        correlation: 0.5951098244376305
    },
    {
        a: "culmen_depth_mm",
        b: "culmen_length_mm",
        correlation: -0.2350528703555326
    },
    {
        a: "culmen_depth_mm",
        b: "culmen_depth_mm",
        correlation: 1
    },
    {
        a: "culmen_depth_mm",
        b: "flipper_length_mm",
        correlation: -0.5838512164654125
    },
    {
        a: "culmen_depth_mm",
        b: "body_mass_g",
        correlation: -0.4719156211860666
    },
    {
        a: "flipper_length_mm",
        b: "culmen_length_mm",
        correlation: 0.6561813407464275
    },
    {
        a: "flipper_length_mm",
        b: "culmen_depth_mm",
        correlation: -0.5838512164654125
    },
    {
        a: "flipper_length_mm",
        b: "flipper_length_mm",
        correlation: 1
    },
    {
        a: "flipper_length_mm",
        b: "body_mass_g",
        correlation: 0.8712017673060116
    },
    {
        a: "body_mass_g",
        b: "culmen_length_mm",
        correlation: 0.5951098244376305
    },
    {
        a: "body_mass_g",
        b: "culmen_depth_mm",
        correlation: -0.4719156211860666
    },
    {
        a: "body_mass_g",
        b: "flipper_length_mm",
        correlation: 0.8712017673060116
    },
    {
        a: "body_mass_g",
        b: "body_mass_g",
        correlation: 1
    }
];
const interviewData = [
    {
        theme: 'Academic Difficulty',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Belonging',
        identities: {
            Disabled: 13,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Career Preparation',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Cultural Representation',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Faculty Support',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Family Pressure',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Financial Struggles',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Identity & Discrimination',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Mental Health',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Language Barriers',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 5,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Peer Relationships',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Personal Growth',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Support Networks',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    },
    {
        theme: 'Work-Life Balance',
        identities: {
            Disabled: 1,
            'First-Generation': 2,
            Immigrant: 3,
            'International Student': 4,
            'LGBTQ+': 5,
            'Low-Income': 6,
            'Non-Traditional Age': 7,
            Parent: 8,
            Religious: 9,
            Rural: 10,
            'STEM Minoritized': 11,
            'Student of Color': 12,
            'Transfer Student': 13,
            Veteran: 14,
            'Working Student': 14
        }
    }
];
var _c;
__turbopack_context__.k.register(_c, "Insights");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_c06ea31e._.js.map