'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
    CHEVRON_PALETTE,
    QUARTER_TICKS,
    SENTIMENT_RING,
    SIGNIFICANCE_RADIUS,
    TERM_MIDPOINTS,
} from './timeline-tokens'

export const timelineInterviewMeta = {
    title: "Interview Timeline",
    description:
        "Annotated narrative spine. Each event is plotted at its true position on a normalized scale spanning pre-college through post-college, with markers sized by quote significance and ringed by sentiment. Selecting an event reveals its anchored quote, themes, and surrounding context.",
}

const PERIOD_FALLBACK = {
    freshman: 0.125,
    sophomore: 0.375,
    junior: 0.625,
    senior: 0.875,
    'pre-college': -0.125,
    precollege: -0.125,
    'post-college': 1.125,
    postcollege: 1.125,
}

function periodToPosition(periodStr) {
    const p = String(periodStr ?? '').toLowerCase()
    for (const [key, val] of Object.entries(PERIOD_FALLBACK)) {
        if (p.includes(key)) return val
    }
    return 0.5
}

function resolvePosition(d) {
    if (typeof d?.position === 'number' && Number.isFinite(d.position)) return d.position
    if (d?.term && TERM_MIDPOINTS[d.term] !== undefined) return TERM_MIDPOINTS[d.term]
    return periodToPosition(d?.period)
}

function formatTerm(term) {
    if (!term || term === 'unknown') return ''
    return term.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const SENTIMENT_GLYPH = {
    positive: '+',
    negative: '−',
    mixed: '±',
    neutral: '·',
}

export default function Timeline({ data, showEventLabels = true }) {
    const wrapRef = useRef(null)
    const [width, setWidth] = useState(800)
    const [selected, setSelected] = useState(0)
    const [hovered, setHovered] = useState(null)
    const [appeared, setAppeared] = useState(false)

    useLayoutEffect(() => {
        const el = wrapRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const w = Math.round(e.contentRect.width)
                if (w > 0) setWidth(w)
            }
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        const t = setTimeout(() => setAppeared(true), 30)
        return () => clearTimeout(t)
    }, [])

    const events = Array.isArray(data) ? data : []
    const positions = events.map(resolvePosition)
    const minPos = positions.length ? Math.min(...positions) : 0
    const maxPos = positions.length ? Math.max(...positions) : 1
    const domainStart = Math.min(-0.25, Math.floor(minPos * 4) / 4)
    const domainEnd = Math.max(1.25, Math.ceil(maxPos * 4) / 4)

    const visibleSegments = CHEVRON_PALETTE.filter(
        (s) => s.end > domainStart && s.start < domainEnd,
    )

    const marginLeft = 24
    const marginRight = 24
    const innerWidth = Math.max(120, width - marginLeft - marginRight)
    const totalDomain = domainEnd - domainStart
    const xFromPosition = (pos) =>
        marginLeft + ((pos - domainStart) / totalDomain) * innerWidth

    const axisHeight = 44
    const axisNotch = 9
    const axisGap = 2
    const topBandHeight = showEventLabels ? 48 : 12  // mini-labels above axis (collapsed when labels are off)
    const tickBandHeight = 22  // quarter tick labels between top labels and axis
    const axisY = topBandHeight + tickBandHeight + axisHeight / 2
    const totalHeight = topBandHeight + tickBandHeight + axisHeight + 18

    const chevrons = visibleSegments.map((seg, i) => {
        const segStart = Math.max(seg.start, domainStart)
        const segEnd = Math.min(seg.end, domainEnd)
        const left = xFromPosition(segStart) + (i === 0 ? 0 : axisGap / 2)
        const right = xFromPosition(segEnd) - (i === visibleSegments.length - 1 ? 0 : axisGap / 2)
        const top = axisY - axisHeight / 2
        const bottom = axisY + axisHeight / 2
        const pathD = [
            `M ${left} ${top}`,
            `L ${left + axisNotch} ${axisY}`,
            `L ${left} ${bottom}`,
            `L ${right - axisNotch} ${bottom}`,
            `L ${right} ${axisY}`,
            `L ${right - axisNotch} ${top}`,
            'Z',
        ].join(' ')
        return { ...seg, pathD, cx: (left + right) / 2, cy: axisY, segStart, segEnd }
    })

    // Per-event x with collision nudge for the mini-labels.
    const eventOrder = useMemo(() => {
        const indexed = events.map((d, i) => ({ i, pos: resolvePosition(d) }))
        indexed.sort((a, b) => a.pos - b.pos)
        return indexed
    }, [events])

    const eventX = useMemo(() => {
        const minSep = 32
        const out = new Array(events.length)
        let lastX = -Infinity
        for (const { i, pos } of eventOrder) {
            let x = xFromPosition(pos)
            if (x - lastX < minSep) x = lastX + minSep
            const cap = width - marginRight - 8
            if (x > cap) x = cap
            out[i] = x
            lastX = x
        }
        return out
    }, [events, eventOrder, width, totalDomain, domainStart, innerWidth])

    const orderIndexOf = useMemo(() => {
        const m = new Map()
        eventOrder.forEach((e, idx) => m.set(e.i, idx))
        return m
    }, [eventOrder])

    function step(delta) {
        if (!events.length) return
        setSelected((cur) => {
            const orderIdx = orderIndexOf.get(cur) ?? 0
            const nextOrder = (orderIdx + delta + events.length) % events.length
            return eventOrder[nextOrder].i
        })
    }

    const containerStyle = {
        position: 'relative',
        width: '100%',
        fontFamily: 'var(--font-inter-tight), system-ui, sans-serif',
        color: '#212529',
    }

    const selectedEvent = events[selected]

    return (
        <div ref={wrapRef} style={containerStyle}>
            <style>{TIMELINE_CSS}</style>

            <div
                className="tl-axis-wrap"
                tabIndex={0}
                role="group"
                aria-label="Interview timeline"
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1) }
                    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1) }
                    else if (e.key === 'Home') { e.preventDefault(); setSelected(eventOrder[0]?.i ?? 0) }
                    else if (e.key === 'End') { e.preventDefault(); setSelected(eventOrder[eventOrder.length - 1]?.i ?? 0) }
                }}
            >
                <svg
                    width={width}
                    height={totalHeight}
                    role="img"
                    aria-label="Timeline axis"
                    style={{ display: 'block', overflow: 'visible' }}
                >
                    <defs>
                        <filter id="tl-grain" x="0" y="0" width="100%" height="100%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
                            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
                        </filter>
                        <pattern id="tl-grain-pat" width={width} height={totalHeight} patternUnits="userSpaceOnUse">
                            <rect width={width} height={totalHeight} filter="url(#tl-grain)" />
                        </pattern>
                    </defs>

                    {/* Quarter ticks (under the chevron) */}
                    <g aria-hidden="true">
                        {chevrons
                            .filter((c) => !['pre_college', 'post_college'].includes(c.key))
                            .flatMap((c) => {
                                const yearStart = c.start
                                return QUARTER_TICKS.map((q, qi) => {
                                    const pos = yearStart + q.pos - 0.0625
                                    if (pos < domainStart || pos > domainEnd) return null
                                    const x = xFromPosition(pos)
                                    return (
                                        <g key={`${c.key}-${qi}`}>
                                            <line
                                                x1={x}
                                                x2={x}
                                                y1={topBandHeight + 4}
                                                y2={topBandHeight + tickBandHeight - 4}
                                                stroke="#C9C2BD"
                                                strokeWidth={0.75}
                                            />
                                            {(q.label === 'FALL' || q.label === 'SPRING') ? (
                                                <text
                                                    x={x}
                                                    y={topBandHeight + tickBandHeight - 8}
                                                    fontSize={8.5}
                                                    fontFamily="var(--font-inter-tight), sans-serif"
                                                    fill="#A39C97"
                                                    textAnchor="middle"
                                                    style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
                                                >
                                                    {q.label}
                                                </text>
                                            ) : null}
                                        </g>
                                    )
                                })
                            })}
                    </g>

                    {/* Chevrons */}
                    <g aria-hidden="true">
                        {chevrons.map((seg, i) => (
                            <g
                                key={seg.key}
                                className={appeared ? 'tl-chevron tl-chevron-in' : 'tl-chevron'}
                                style={{ animationDelay: `${i * 90}ms` }}
                            >
                                <path d={seg.pathD} fill={seg.color} />
                                {seg.key !== 'pre_college' && seg.key !== 'post_college' ? (
                                    <text
                                        x={seg.cx}
                                        y={seg.cy + 4}
                                        textAnchor="middle"
                                        fill="#1A1A1A"
                                        fontSize={9}
                                        fontFamily="var(--font-inter-tight), sans-serif"
                                        fontWeight={600}
                                        style={{ letterSpacing: '0.02em', textTransform: 'uppercase' }}
                                    >
                                        {seg.label}
                                    </text>
                                ) : null}
                            </g>
                        ))}
                    </g>

                    {/* Event markers */}
                    <g>
                        {events.map((d, i) => {
                            const x = eventX[i]
                            const ringColor = SENTIMENT_RING[d.sentiment] ?? SENTIMENT_RING.neutral
                            const baseR = SIGNIFICANCE_RADIUS[d.significanceLevel] ?? SIGNIFICANCE_RADIUS.default
                            const isSel = i === selected
                            const isHov = i === hovered
                            const r = isSel ? baseR + 3 : isHov ? baseR + 1.5 : baseR
                            const labelY = topBandHeight - 14
                            const orderIdx = orderIndexOf.get(i) ?? 0
                            const labelText = (d.event ?? '').split(/\s+/).slice(0, 4).join(' ')
                            return (
                                <g
                                    key={d.id ?? i}
                                    className={appeared ? 'tl-marker tl-marker-in' : 'tl-marker'}
                                    style={{ animationDelay: `${600 + orderIdx * 70}ms` }}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                                    onClick={() => setSelected(i)}
                                >
                                    {showEventLabels && (isSel || isHov) ? (
                                        <>
                                            {/* connector to mini-label */}
                                            <line
                                                x1={x}
                                                x2={x}
                                                y1={axisY - axisHeight / 2}
                                                y2={labelY + 6}
                                                stroke={isSel ? '#212529' : '#B5ADA6'}
                                                strokeWidth={isSel ? 1 : 0.5}
                                            />
                                            {/* mini label */}
                                            <text
                                                x={x}
                                                y={labelY}
                                                textAnchor={x < marginLeft + 60 ? 'start' : x > width - marginRight - 60 ? 'end' : 'middle'}
                                                fontFamily="var(--font-fraunces), Georgia, serif"
                                                fontSize={isSel ? 12 : 11}
                                                fontStyle="italic"
                                                fill={isSel ? '#212529' : '#5A544F'}
                                                opacity={isSel ? 1 : 0.85}
                                            >
                                                {labelText}
                                                {labelText && (d.event ?? '').split(/\s+/).length > 4 ? '…' : ''}
                                            </text>
                                        </>
                                    ) : null}
                                    {/* dot */}
                                    <circle
                                        cx={x}
                                        cy={axisY}
                                        r={r + 4}
                                        fill="transparent"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <circle
                                        cx={x}
                                        cy={axisY}
                                        r={r}
                                        fill="#FBF8F4"
                                        stroke={ringColor}
                                        strokeWidth={isSel ? 2.5 : 1.75}
                                        style={{ cursor: 'pointer', transition: 'r 180ms ease, stroke-width 180ms ease' }}
                                    />
                                    {d.sentiment === 'mixed' ? (
                                        <path
                                            d={`M ${x} ${axisY - r} A ${r} ${r} 0 0 1 ${x} ${axisY + r} Z`}
                                            fill={ringColor}
                                            opacity={0.5}
                                            pointerEvents="none"
                                        />
                                    ) : null}
                                    <text
                                        x={x}
                                        y={axisY + 0.5}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={r > 6 ? 10 : 9}
                                        fontFamily="var(--font-inter-tight), sans-serif"
                                        fontWeight={600}
                                        fill={ringColor}
                                        pointerEvents="none"
                                    >
                                        {SENTIMENT_GLYPH[d.sentiment] ?? '·'}
                                    </text>
                                </g>
                            )
                        })}
                    </g>

                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={totalHeight}
                        fill="url(#tl-grain-pat)"
                        pointerEvents="none"
                    />
                </svg>
            </div>

            {selectedEvent ? (
                <div className={`tl-card ${appeared ? 'tl-card-in' : ''}`} style={{ animationDelay: '900ms' }}>
                    <div className="tl-card-eyebrow">
                        <span className="tl-card-eyebrow-term">
                            {formatTerm(selectedEvent.term) || selectedEvent.period || 'Untitled period'}
                        </span>
                        {selectedEvent.significanceLevel ? (
                            <span className={`tl-sig tl-sig-${selectedEvent.significanceLevel}`}>
                                {selectedEvent.significanceLevel} significance
                            </span>
                        ) : null}
                        <span className={`tl-senti tl-senti-${selectedEvent.sentiment ?? 'neutral'}`}>
                            {selectedEvent.sentiment ?? 'neutral'}
                        </span>
                    </div>

                    <h3 className="tl-card-title">{selectedEvent.event || 'Untitled event'}</h3>

                    {selectedEvent.significance ? (
                        <p className="tl-card-significance">{selectedEvent.significance}</p>
                    ) : null}

                    {selectedEvent.linkedQuotes && selectedEvent.linkedQuotes.length > 0 ? (
                        <div className="tl-quotes">
                            {selectedEvent.linkedQuotes.slice(0, 2).map((q) => (
                                <blockquote key={q.id} className="tl-quote">
                                    <span className="tl-quote-mark" aria-hidden="true">“</span>
                                    {q.text}
                                    <span className="tl-quote-mark" aria-hidden="true">”</span>
                                    {q.context ? <cite className="tl-quote-context">— {q.context}</cite> : null}
                                </blockquote>
                            ))}
                            {selectedEvent.linkedQuotes.length > 2 ? (
                                <div className="tl-quote-more">
                                    +{selectedEvent.linkedQuotes.length - 2} more anchored quote{selectedEvent.linkedQuotes.length - 2 === 1 ? '' : 's'}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {selectedEvent.linkedThemes && selectedEvent.linkedThemes.length > 0 ? (
                        <div className="tl-chips">
                            <span className="tl-chips-label">Themes</span>
                            {selectedEvent.linkedThemes.map((th) => (
                                <span key={th.id} className="tl-chip">{th.title}</span>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="tl-nav" aria-hidden="true">
                <button type="button" className="tl-nav-btn" onClick={() => step(-1)} aria-label="Previous event">←</button>
                <span className="tl-nav-counter">
                    {events.length ? `${(orderIndexOf.get(selected) ?? 0) + 1} / ${events.length}` : '—'}
                </span>
                <button type="button" className="tl-nav-btn" onClick={() => step(1)} aria-label="Next event">→</button>
            </div>
        </div>
    )
}

const TIMELINE_CSS = `
.tl-axis-wrap { outline: none; padding: 8px 0; }
.tl-axis-wrap:focus-visible { box-shadow: 0 0 0 2px #D73F0933 inset; border-radius: 4px; }

.tl-chevron { opacity: 0; transform: translateX(-8px); }
.tl-chevron-in { animation: tl-chevron-in 380ms cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes tl-chevron-in { to { opacity: 1; transform: translateX(0); } }

.tl-marker { opacity: 0; }
.tl-marker-in { animation: tl-marker-in 360ms cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes tl-marker-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.tl-card {
    margin-top: 22px;
    padding: 22px 24px 24px;
    background: #FBF8F4;
    border-top: 1px solid #1A1A1A;
    border-bottom: 1px solid #E0D8D0;
    position: relative;
    opacity: 0;
}
.tl-card::before {
    content: '';
    position: absolute;
    top: -1px; left: 0; height: 3px; width: 56px;
    background: #D73F09;
}
.tl-card-in { animation: tl-card-in 420ms cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes tl-card-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.tl-card-eyebrow {
    display: flex; gap: 14px; align-items: center; flex-wrap: wrap;
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #5A544F;
    margin-bottom: 10px;
}
.tl-card-eyebrow-term { color: #212529; font-weight: 600; }
.tl-sig, .tl-senti { padding: 2px 8px; border: 1px solid #C9C2BD; border-radius: 999px; }
.tl-sig-high { color: #8A2A05; border-color: #D73F0966; }
.tl-sig-medium { color: #5A544F; }
.tl-sig-low { color: #8A847F; }
.tl-senti-positive { color: #7A5A20; border-color: #C68B3F66; }
.tl-senti-negative { color: #3D454C; border-color: #5B677066; }
.tl-senti-mixed { color: #7A3A14; border-color: #A05C2C66; }
.tl-senti-neutral { color: #6E665F; }

.tl-card-title {
    font-family: var(--font-fraunces), Georgia, serif;
    font-weight: 500;
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1.18;
    margin: 0 0 10px 0;
    color: #1A1A1A;
    letter-spacing: -0.01em;
}

.tl-card-significance {
    font-family: var(--font-fraunces), Georgia, serif;
    font-style: italic;
    font-size: 16px;
    line-height: 1.5;
    color: #423E3C;
    margin: 0 0 16px 0;
    max-width: 64ch;
}

.tl-quotes { display: flex; flex-direction: column; gap: 14px; margin: 18px 0 8px; }
.tl-quote {
    margin: 0;
    padding-left: 18px;
    border-left: 2px solid #D73F09;
    font-family: var(--font-fraunces), Georgia, serif;
    font-size: 17px;
    line-height: 1.55;
    color: #212529;
    position: relative;
}
.tl-quote-mark {
    font-family: var(--font-fraunces), Georgia, serif;
    color: #D73F09;
    font-size: 22px;
    line-height: 0;
    margin: 0 2px;
}
.tl-quote-context {
    display: block;
    margin-top: 6px;
    font-family: var(--font-inter-tight), sans-serif;
    font-style: normal;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8A847F;
}
.tl-quote-more {
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 11px;
    color: #8A847F;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.tl-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; }
.tl-chips-label {
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 10.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8A847F;
    margin-right: 4px;
}
.tl-chip {
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 12px;
    padding: 3px 10px;
    border: 1px solid #1A1A1A;
    border-radius: 999px;
    color: #1A1A1A;
    background: transparent;
}

.tl-rail {
    margin-top: 18px;
    display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
    padding: 10px 0 4px;
    border-top: 1px dashed #C9C2BD;
    opacity: 0;
}
.tl-rail-in { animation: tl-card-in 460ms cubic-bezier(.2,.8,.2,1) 200ms forwards; }
.tl-rail-label {
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #8A847F;
}
.tl-rail-chip {
    font-family: var(--font-fraunces), Georgia, serif;
    font-style: italic;
    font-size: 13px;
    color: #5A544F;
    padding: 1px 8px;
    border-bottom: 1px solid #B5ADA6;
}

.tl-nav {
    margin-top: 14px;
    display: flex; align-items: center; gap: 14px;
    font-family: var(--font-inter-tight), sans-serif;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #8A847F;
}
.tl-nav-btn {
    appearance: none;
    background: transparent;
    border: 1px solid #C9C2BD;
    color: #1A1A1A;
    width: 30px; height: 30px;
    border-radius: 999px;
    cursor: pointer;
    transition: border-color 160ms ease, color 160ms ease;
    font-size: 14px;
}
.tl-nav-btn:hover { border-color: #1A1A1A; }
.tl-nav-btn:focus-visible { outline: 2px solid #D73F0966; outline-offset: 2px; }
.tl-nav-counter { letter-spacing: 0.2em; }
`
