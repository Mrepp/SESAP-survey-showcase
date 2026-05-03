'use client'
import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export const majorDoughnutChartMeta = {
    title: 'Major Doughnut Chart',
    description: 'Shows the distribution of majors across all interviews.',
}

const SLICE_COLORS = [
    'rgba(255, 99, 132, 0.85)',
    'rgba(75, 192, 192, 0.85)',
    'rgba(53, 162, 235, 0.85)',
    'rgba(255, 206, 86, 0.85)',
    'rgba(153, 102, 255, 0.85)',
    'rgba(255, 159, 64, 0.85)',
    'rgba(199, 199, 199, 0.85)',
    'rgba(83, 102, 255, 0.85)',
    'rgba(255, 99, 255, 0.85)',
    'rgba(99, 255, 132, 0.85)',
    'rgba(255, 132, 99, 0.85)',
    'rgba(132, 99, 255, 0.85)',
    'rgba(99, 255, 255, 0.85)',
    'rgba(255, 255, 99, 0.85)',
]

function colorsForSlices(n) {
    return Array.from({ length: n }, (_, i) => SLICE_COLORS[i % SLICE_COLORS.length])
}

/** Draws title in the doughnut hole; uses chart area center so layout matches legend offset. */
const majorDoughnutCenterLabelPlugin = {
    id: 'majorDoughnutCenterLabel',
    afterDraw(chart) {
        const { ctx, chartArea } = chart
        if (!chartArea || chartArea.width <= 0 || chartArea.height <= 0) return

        const text = 'Major Distribution'
        const cx = chartArea.left + chartArea.width / 2
        const cy = chartArea.top + chartArea.height / 2
        const fontSize = Math.round(Math.max(11, Math.min(18, chartArea.width * 0.07)))

        ctx.save()
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.fillStyle = '#2D3748'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, cx, cy)
        ctx.restore()
    },
}

export default function MajorDoughnutChart({ majorData = [], width, height, showLegend = false }) {
    const chartData = useMemo(() => {
        const labels = majorData.map((d) => d.major)
        const data = majorData.map((d) => d.count)
        const backgroundColor = colorsForSlices(labels.length)
        return {
            labels,
            datasets: [
                {
                    label: 'Interviews',
                    data,
                    backgroundColor,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 1,
                },
            ],
        }
    }, [majorData])

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: !(width != null && height != null),
            plugins: {
                legend: {
                    display: showLegend,
                    position: 'left',
                    labels: { font: { size: 15 } },
                },
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const values = ctx.dataset.data
                            const total = values.reduce((a, b) => a + b, 0)
                            const v = Number(ctx.raw) || 0
                            const pct = total ? ((v / total) * 100).toFixed(1) : '0'
                            return ` ${ctx.label}: ${v} (${pct}%)`
                        },
                    },
                },
            },
        }),
        [width, height, showLegend]
    )

    const wrapStyle =
        width != null && height != null
            ? { width, height, maxWidth: '100%', margin: '0 auto' }
            : { height: '100%', minHeight: 200 }

    if (!majorData.length) return null

    return (
        <div style={wrapStyle}>
            <Doughnut data={chartData} options={options} plugins={[majorDoughnutCenterLabelPlugin]} />
        </div>
    )
}
