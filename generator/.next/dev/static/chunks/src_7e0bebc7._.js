(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/visualizations/WordCloud.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// CITE THIS!!!!!!!!!!!!!! https://observablehq.com/@d3/word-cloud
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$rooks$2f$use$2d$window$2d$size$2f$lib$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@rooks/use-window-size/lib/index.esm.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// can't put window.innerWidth directly into function so this is workaround
// use-window-size package https://www.npmjs.com/package/@rooks/use-window-size
function window() {
    _s();
    const { innerWidth, innerHeight, outerHeight, outerWidth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$rooks$2f$use$2d$window$2d$size$2f$lib$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    return innerWidth;
}
_s(window, "Nm8LCqVDEnyiCLvrc++kUP4yZcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$rooks$2f$use$2d$window$2d$size$2f$lib$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
function WordCloud({ size = (group)=>group.length, word = (d)=>d, marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0, width = window(), height = 200, maxWords = 250, fontFamily = "sans-serif", fontScale = 20, fill = null, padding = 3, rotate = 0, invalidation// when this promise resolves, stop the simulation
 } = {}) {
    _s1();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [stopwords, setStopwords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
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
                width,
                height
            ]).attr("width", width).attr("font-family", fontFamily).attr("text-anchor", "middle").attr("style", "max-width: 100%; height: auto; height: intrinsic;");
            const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
            const cloud = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$cloud$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().size([
                width - marginLeft - marginRight,
                height - marginTop - marginBottom
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
    }["WordCloud.useEffect"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            height: '200px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            ref: svgRef,
            style: {
                width: '100%',
                height: '100%'
            }
        }, void 0, false, {
            fileName: "[project]/src/components/visualizations/WordCloud.jsx",
            lineNumber: 111,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/visualizations/WordCloud.jsx",
        lineNumber: 110,
        columnNumber: 9
    }, this);
}
_s1(WordCloud, "PmcLdLEcA44j1cPGHSzl584rKls=");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@chakra-ui/react/dist/esm/components/heading/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$WordCloud$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/visualizations/WordCloud.jsx [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/visualizations/BarChart'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
;
;
function Insights() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$heading$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Heading"], {
                children: "Insights"
            }, void 0, false, {
                fileName: "[project]/src/app/insights/page.jsx",
                lineNumber: 13,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$chakra$2d$ui$2f$react$2f$dist$2f$esm$2f$components$2f$box$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box"], {
                w: "fill",
                marginTop: "-30px",
                marginLeft: "-30px",
                marginRight: "-30px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$visualizations$2f$WordCloud$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/insights/page.jsx",
                    lineNumber: 15,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/insights/page.jsx",
                lineNumber: 14,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BarChart, {}, void 0, false, {
                fileName: "[project]/src/app/insights/page.jsx",
                lineNumber: 17,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_c = Insights;
var _c;
__turbopack_context__.k.register(_c, "Insights");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_7e0bebc7._.js.map