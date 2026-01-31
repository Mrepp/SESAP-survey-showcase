module.exports = [
"[project]/src/components/visualizations/BarChart.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BarChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$plot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/plot.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/marks/bar.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$transforms$2f$group$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@observablehq/plot/src/transforms/group.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function BarChart() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$plot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plot"]({
        marginLeft: 90,
        marks: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$marks$2f$bar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["barX"](themes, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$observablehq$2f$plot$2f$src$2f$transforms$2f$group$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["groupY"]({
                x: "count"
            }, {
                fill: "frequency",
                y: "theme",
                sort: {
                    y: "x",
                    reverse: true
                }
            }))
        ]
    });
}
const themes = [
    {
        theme: 'Academic Difficulty',
        impactScore: '1',
        frequency: '9'
    },
    {
        theme: 'Faculty Support',
        impactScore: '2',
        frequency: '8'
    },
    {
        theme: 'Peer Relationships',
        impactScore: '2',
        frequency: '7'
    },
    {
        theme: 'Belonging',
        impactScore: '3',
        frequency: '6'
    },
    {
        theme: 'Cultural Representation',
        impactScore: '4',
        frequency: '6'
    },
    {
        theme: 'Financial Struggles',
        impactScore: '5',
        frequency: '5'
    },
    {
        theme: 'Mental Health',
        impactScore: '5',
        frequency: '4'
    },
    {
        theme: 'Family Pressure',
        impactScore: '6',
        frequency: '3'
    },
    {
        theme: 'Work-Life Balance',
        impactScore: '1',
        frequency: '2'
    },
    {
        theme: 'Identity & Discrimination',
        impactScore: '2',
        frequency: '3'
    },
    {
        theme: 'Career Preparation',
        impactScore: '9',
        frequency: '4'
    },
    {
        theme: 'Language Barriers',
        impactScore: '8',
        frequency: '0'
    },
    {
        theme: 'Support Networks',
        impactScore: '8',
        frequency: '1'
    },
    {
        theme: 'Personal Growth',
        impactScore: '7',
        frequency: '2'
    }
];
}),
"[project]/src/app/insights/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Insights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@chakra-ui/react/dist/esm/components/heading/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$BarChart$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/BarChart.jsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function Insights() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Heading"], {
            children: "Insights"
        }, void 0, false, {
            fileName: "[project]/src/app/insights/page.jsx",
            lineNumber: 12,
            columnNumber: 13
        }, this)
    }, void 0, false);
} //<BarChart/>
}),
];

//# sourceMappingURL=src_0671c60e._.js.map