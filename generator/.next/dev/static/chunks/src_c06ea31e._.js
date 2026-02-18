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
const themeColors = generateColors(interviewData.length);
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
function BarChart() {
    _s();
    const [labels, setLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(fallbackLabels);
    const [chartData, setChartData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
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
            lineNumber: 139,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
        options: options,
        data: chartData
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/BarChart.jsx",
        lineNumber: 142,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function BubbleChart({ data, width = 928, height = width }) {
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
            ]).attr("style", "max-width: 100%; height: auto; font: 30px sans-serif;").attr("text-anchor", "middle");
            // Place each (leaf) node according to the layout's x and y values.
            const node = svg.append("g").selectAll().data(root.leaves()).join("g").attr("transform", {
                "BubbleChart.useEffect.node": (d)=>`translate(${d.x},${d.y})`
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
            // Add a label.
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
        lineNumber: 86,
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
function Correlation() {
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
        lineNumber: 74,
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
function WordCloud({ size = (group)=>group.length, word = (d)=>d, marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0, width, height, maxWords = 250, fontFamily = "sans-serif", fontScale = 20, fill = null, padding = 3, rotate = ()=>Math.floor(Math.random() * 2) * 90, invalidation// when this promise resolves, stop the simulation
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
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
            lineNumber: 135,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/WordCloud.jsx",
        lineNumber: 134,
        columnNumber: 9
    }, this);
}
_s(WordCloud, "jFRegdVmWkpNRkjXXEseTGz+PpI=");
_c = WordCloud;
const text = `I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our nation.

Five score years ago, a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation. This momentous decree came as a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice. It came as a joyous daybreak to end the long night of their captivity.

But one hundred years later, the Negro still is not free. One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination. One hundred years later, the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity. One hundred years later, the Negro is still languishing in the corners of American society and finds himself an exile in his own land. So we have come here today to dramatize a shameful condition.

In a sense we have come to our nation’s capital to cash a check. When the architects of our republic wrote the magnificent words of the Constitution and the Declaration of Independence, they were signing a promissory note to which every American was to fall heir. This note was a promise that all men, yes, black men as well as white men, would be guaranteed the unalienable rights of life, liberty, and the pursuit of happiness.

It is obvious today that America has defaulted on this promissory note insofar as her citizens of color are concerned. Instead of honoring this sacred obligation, America has given the Negro people a bad check, a check which has come back marked “insufficient funds.” But we refuse to believe that the bank of justice is bankrupt. We refuse to believe that there are insufficient funds in the great vaults of opportunity of this nation. So we have come to cash this check — a check that will give us upon demand the riches of freedom and the security of justice. We have also come to this hallowed spot to remind America of the fierce urgency of now. This is no time to engage in the luxury of cooling off or to take the tranquilizing drug of gradualism. Now is the time to make real the promises of democracy. Now is the time to rise from the dark and desolate valley of segregation to the sunlit path of racial justice. Now is the time to lift our nation from the quick sands of racial injustice to the solid rock of brotherhood. Now is the time to make justice a reality for all of God’s children.

It would be fatal for the nation to overlook the urgency of the moment. This sweltering summer of the Negro’s legitimate discontent will not pass until there is an invigorating autumn of freedom and equality. Nineteen sixty-three is not an end, but a beginning. Those who hope that the Negro needed to blow off steam and will now be content will have a rude awakening if the nation returns to business as usual. There will be neither rest nor tranquility in America until the Negro is granted his citizenship rights. The whirlwinds of revolt will continue to shake the foundations of our nation until the bright day of justice emerges.

But there is something that I must say to my people who stand on the warm threshold which leads into the palace of justice. In the process of gaining our rightful place we must not be guilty of wrongful deeds. Let us not seek to satisfy our thirst for freedom by drinking from the cup of bitterness and hatred.

We must forever conduct our struggle on the high plane of dignity and discipline. We must not allow our creative protest to degenerate into physical violence. Again and again we must rise to the majestic heights of meeting physical force with soul force. The marvelous new militancy which has engulfed the Negro community must not lead us to a distrust of all white people, for many of our white brothers, as evidenced by their presence here today, have come to realize that their destiny is tied up with our destiny. They have come to realize that their freedom is inextricably bound to our freedom. We cannot walk alone.

As we walk, we must make the pledge that we shall always march ahead. We cannot turn back. There are those who are asking the devotees of civil rights, “When will you be satisfied?” We can never be satisfied as long as the Negro is the victim of the unspeakable horrors of police brutality. We can never be satisfied, as long as our bodies, heavy with the fatigue of travel, cannot gain lodging in the motels of the highways and the hotels of the cities. We cannot be satisfied as long as the Negro’s basic mobility is from a smaller ghetto to a larger one. We can never be satisfied as long as our children are stripped of their selfhood and robbed of their dignity by signs stating “For Whites Only”. We cannot be satisfied as long as a Negro in Mississippi cannot vote and a Negro in New York believes he has nothing for which to vote. No, no, we are not satisfied, and we will not be satisfied until justice rolls down like waters and righteousness like a mighty stream.

I am not unmindful that some of you have come here out of great trials and tribulations. Some of you have come fresh from narrow jail cells. Some of you have come from areas where your quest for freedom left you battered by the storms of persecution and staggered by the winds of police brutality. You have been the veterans of creative suffering. Continue to work with the faith that unearned suffering is redemptive.

Go back to Mississippi, go back to Alabama, go back to South Carolina, go back to Georgia, go back to Louisiana, go back to the slums and ghettos of our northern cities, knowing that somehow this situation can and will be changed. Let us not wallow in the valley of despair.

I say to you today, my friends, so even though we face the difficulties of today and tomorrow, I still have a dream. It is a dream deeply rooted in the American dream.

I have a dream that one day this nation will rise up and live out the true meaning of its creed: “We hold these truths to be self-evident: that all men are created equal.”

I have a dream that one day on the red hills of Georgia the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.

I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice, sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice.

I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.

I have a dream today.

I have a dream that one day, down in Alabama, with its vicious racists, with its governor having his lips dripping with the words of interposition and nullification; one day right there in Alabama, little black boys and black girls will be able to join hands with little white boys and white girls as sisters and brothers.

I have a dream today.

I have a dream that one day every valley shall be exalted, every hill and mountain shall be made low, the rough places will be made plain, and the crooked places will be made straight, and the glory of the Lord shall be revealed, and all flesh shall see it together.

This is our hope. This is the faith that I go back to the South with. With this faith we will be able to hew out of the mountain of despair a stone of hope. With this faith we will be able to transform the jangling discords of our nation into a beautiful symphony of brotherhood. With this faith we will be able to work together, to pray together, to struggle together, to go to jail together, to stand up for freedom together, knowing that we will be free one day.

This will be the day when all of God’s children will be able to sing with a new meaning, “My country, ‘tis of thee, sweet land of liberty, of thee I sing. Land where my fathers died, land of the pilgrim’s pride, from every mountainside, let freedom ring.”

And if America is to be a great nation this must become true. So let freedom ring from the prodigious hilltops of New Hampshire. Let freedom ring from the mighty mountains of New York. Let freedom ring from the heightening Alleghenies of Pennsylvania!

Let freedom ring from the snowcapped Rockies of Colorado!

Let freedom ring from the curvaceous slopes of California!

But not only that; let freedom ring from Stone Mountain of Georgia!

Let freedom ring from Lookout Mountain of Tennessee!

Let freedom ring from every hill and molehill of Mississippi. From every mountainside, let freedom ring.

And when this happens, when we allow freedom to ring, when we let it ring from every village and every hamlet, from every state and every city, we will be able to speed up that day when all of God’s children, black men and white men, Jews and Gentiles, Protestants and Catholics, will be able to join hands and sing in the words of the old Negro spiritual, “Free at last! free at last! thank God Almighty, we are free at last!”`;
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
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                    bg: "white",
                    w: "40%",
                    minH: "75vh",
                    borderWidth: "1px",
                    borderRadius: "25px",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$WordCloud$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/insights/page.jsx",
                        lineNumber: 23,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 22,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                    bg: "white",
                    borderWidth: "1px",
                    borderRadius: "25px",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BubbleChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        data: themes
                    }, void 0, false, {
                        fileName: "[project]/src/app/insights/page.jsx",
                        lineNumber: 27,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 26,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$stack$2f$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stack"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            w: "100%",
                            h: "fit-content",
                            bg: "white",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            w: "fit-content",
                            paddingLeft: "20px",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$CorrelationHeatMap$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 32,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                            minH: "300px",
                            h: "fit-content",
                            bg: "white",
                            padding: "20px",
                            borderWidth: "1px",
                            borderRadius: "25px",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BarChart$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/app/insights/page.jsx",
                                lineNumber: 36,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/insights/page.jsx",
                            lineNumber: 35,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 30,
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
        "title": "Language Barriers",
        "impactScore": 10,
        "category": "cat1"
    },
    {
        "title": "Support Networks",
        "impactScore": 5,
        "category": "cat2"
    },
    {
        "title": "Career Preparation",
        "impactScore": 7,
        "category": "cat1"
    },
    {
        "title": "Identity & Discrimination",
        "impactScore": 7,
        "category": "cat2"
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