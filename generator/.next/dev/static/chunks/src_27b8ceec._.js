(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/visualizations/Timeline.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Timeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/extent.js [app-client] (ecmascript) <export default as extent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/time.js [app-client] (ecmascript) <export default as scaleTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-axis/src/axis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-client] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Timeline({ data, width = 640, height = 200, marginTop = 80, marginRight = 20, marginBottom = 90, marginLeft = 20 }) {
    _s();
    const axisRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hoveredIndex, setHoveredIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tooltipPosition, setTooltipPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    // Convert years to Date objects and extract extent
    const years = data.map((d)=>new Date(d.year, 0, 1));
    const yearExtent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"](years);
    // Create time scale for x-axis
    const x = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__["scaleTime"](yearExtent, [
        marginLeft,
        width - marginRight
    ]);
    // Calculate y positions - alternate above and below axis
    const axisY = height - marginBottom;
    const eventOffset = 60; // Distance from axis for events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Timeline.useEffect": ()=>{
            if (axisRef.current) {
                const xAxis = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["axisBottom"](x);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"](axisRef.current).call(xAxis);
            }
        }
    }["Timeline.useEffect"], [
        x
    ]);
    const handleMouseEnter = (e, i)=>{
        setHoveredIndex(i);
        setTooltipPosition({
            x: e.clientX,
            y: e.clientY
        });
    };
    const handleMouseMove = (e)=>{
        if (hoveredIndex !== null) {
            setTooltipPosition({
                x: e.clientX,
                y: e.clientY
            });
        }
    };
    const handleMouseLeave = ()=>{
        setHoveredIndex(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: width,
                height: height,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: marginLeft,
                        y1: axisY,
                        x2: width - marginRight,
                        y2: axisY,
                        stroke: "#333",
                        strokeWidth: "2"
                    }, void 0, false, {
                        fileName: "[project]/src/components/visualizations/Timeline.jsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this),
                    data.map((d, i)=>{
                        const xPos = x(new Date(d.year, 0, 1));
                        // Alternate: even indices below, odd indices above
                        const yPos = axisY + (i % 2 === 0 ? eventOffset : -eventOffset);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: xPos,
                                    y1: axisY,
                                    x2: xPos,
                                    y2: yPos,
                                    stroke: "#333",
                                    strokeWidth: "1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/visualizations/Timeline.jsx",
                                    lineNumber: 74,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    cx: xPos,
                                    cy: yPos,
                                    r: "8",
                                    fill: "white",
                                    stroke: "#333",
                                    strokeWidth: "1",
                                    onMouseEnter: (e)=>handleMouseEnter(e, i),
                                    onMouseMove: handleMouseMove,
                                    onMouseLeave: handleMouseLeave,
                                    style: {
                                        cursor: 'pointer'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/visualizations/Timeline.jsx",
                                    lineNumber: 83,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/components/visualizations/Timeline.jsx",
                            lineNumber: 72,
                            columnNumber: 21
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        ref: axisRef,
                        transform: `translate(0, ${axisY})`
                    }, void 0, false, {
                        fileName: "[project]/src/components/visualizations/Timeline.jsx",
                        lineNumber: 100,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/visualizations/Timeline.jsx",
                lineNumber: 54,
                columnNumber: 9
            }, this),
            hoveredIndex !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    left: `${tooltipPosition.x + 10}px`,
                    top: `${tooltipPosition.y - 10}px`,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    maxWidth: '300px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                },
                children: data[hoveredIndex].event
            }, void 0, false, {
                fileName: "[project]/src/components/visualizations/Timeline.jsx",
                lineNumber: 105,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(Timeline, "MsbzHjaXYQ0b1GK2YLkh/81/pvQ=");
_c = Timeline;
var _c;
__turbopack_context__.k.register(_c, "Timeline");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/timeline/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimelinePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@chakra-ui/react/dist/esm/components/heading/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$Timeline$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/Timeline.jsx [app-client] (ecmascript)");
'use client';
;
;
;
const stuff = [
    {
        year: 2000,
        event: 'In a hole in the ground there lived a hobbit.'
    },
    {
        year: 2007,
        event: 'Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandyhole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.'
    },
    {
        year: 2009,
        event: 'It had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle.'
    },
    {
        year: 2010,
        event: 'The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of visitors.'
    },
    {
        year: 2015,
        event: 'The tunnel wound on and on, going fairly but not quite straight into the side of the hill—The Hill, as all the people for many miles round called it—and many little round doors opened out of it, first on one side and then on another.'
    },
    {
        year: 2020,
        event: 'No going upstairs for the hobbit: bedrooms, bathrooms, cellars, pantries (lots of these), wardrobes (he had whole rooms devoted to clothes), kitchens, dining-rooms, all were on the same floor, and indeed on the same passage.'
    },
    {
        year: 2023,
        event: 'The best rooms were all on the left-hand side (going in), for these were the only ones to have windows, deep-set round windows looking over his garden, and meadows beyond, sloping down to the river.'
    }
];
function TimelinePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Heading"], {
                children: "Timeline"
            }, void 0, false, {
                fileName: "[project]/src/app/timeline/page.js",
                lineNumber: 22,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$Timeline$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: stuff
            }, void 0, false, {
                fileName: "[project]/src/app/timeline/page.js",
                lineNumber: 23,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_c = TimelinePage;
var _c;
__turbopack_context__.k.register(_c, "TimelinePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_27b8ceec._.js.map