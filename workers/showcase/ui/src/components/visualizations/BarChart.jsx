'use client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useMemo } from 'react'
import { IDENTITY_LABELS } from '@sesap/shared'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export const barChartMeta = {
    title: "Theme Frequency by Identity",
    description:
        "Stacked horizontal bars for each theme, split by demographic identity labels collected on interviews.",
}

// Generate colors for each theme
const generateColors = (count) => {
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
        'rgb(255, 255, 99)',
    ];
    // Cycle through colors if we have more themes than colors
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const baseOptions = {
    indexAxis: 'y', // makes the bar chart horizontal
    plugins: {
        title: {
            display: true,
            text: 'Theme Frequency by Identity',
        },
        legend: {
            position: 'bottom',
        },
    },
    responsive: true,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
};

export default function BarChart ({ interviewData, showLegend = false }) {
    const labels = IDENTITY_LABELS;

    const options = useMemo(
        () => ({
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                legend: {
                    ...baseOptions.plugins.legend,
                    display: showLegend,
                },
            },
        }),
        [showLegend]
    );

    const chartData = useMemo(() => {
        const themeColors = generateColors(interviewData.length);
        return {
            labels,
            datasets: interviewData.map((item, index) => ({
                label: item.theme,
                data: labels.map(label => item.identities[label] || 0),
                backgroundColor: themeColors[index],
            })),
        };
    }, [interviewData, labels]);

    return <Bar options={options} data={chartData} />
}

// https://react-chartjs-2.js.org/components/bar
// https://react-chartjs-2.js.org/examples/stacked-bar-chart