(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ex.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
function Timeline({ data, width = 640, height = 400, marginTop = 80, marginRight = 20, marginBottom = 60, marginLeft = 20 }) {
    _s();
    const axisRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
                fileName: "[project]/src/components/ex.jsx",
                lineNumber: 38,
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
                            fileName: "[project]/src/components/ex.jsx",
                            lineNumber: 56,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: xPos,
                            cy: yPos,
                            r: "6",
                            fill: "white",
                            stroke: "#333",
                            strokeWidth: "2"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ex.jsx",
                            lineNumber: 65,
                            columnNumber: 25
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/components/ex.jsx",
                    lineNumber: 54,
                    columnNumber: 21
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                ref: axisRef,
                transform: `translate(0, ${axisY})`
            }, void 0, false, {
                fileName: "[project]/src/components/ex.jsx",
                lineNumber: 78,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ex.jsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
_s(Timeline, "p6mdVW0kpE9iWXRgKoY1F9MpMcs=");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ex$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ex.jsx [app-client] (ecmascript)");
'use client';
;
;
;
const stuff = [
    {
        year: 2000,
        event: 'four score and seven years ago something something something'
    },
    {
        year: 2007,
        event: 'Student moved to college and began as a mechanical engineering student.'
    },
    {
        year: 2009,
        event: 'Switched major to computer science with a focus on blah blah blah.'
    },
    {
        year: 2010,
        event: 'Display theme cloud with bubble sizes representing impact scores (1-10 scale)'
    },
    {
        year: 2015,
        event: 'Display theme cloud with bubble sizes representing impact scores (1-10 scale)'
    },
    {
        year: 2020,
        event: 'Display theme cloud with bubble sizes representing impact scores (1-10 scale)'
    },
    {
        year: 2023,
        event: 'Display theme cloud with bubble sizes representing impact scores (1-10 scale)'
    }
];
function TimelinePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Heading"], {
                children: "Timeline"
            }, void 0, false, {
                fileName: "[project]/src/app/timeline/page.js",
                lineNumber: 23,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ex$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: stuff
            }, void 0, false, {
                fileName: "[project]/src/app/timeline/page.js",
                lineNumber: 24,
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

//# sourceMappingURL=src_0cc09b57._.js.map