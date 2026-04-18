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
import { useState, useEffect, useMemo } from 'react'

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

// Hardcoded labels as fallback in case identities.txt fails to load
const fallbackLabels = ['Disabled', 'First-Generation', 'Immigrant', 'International Student', 'LGBTQ+', 'Low-Income', 'Non-Traditional Age', 'Parent', 'Religious', 'Rural', 'STEM Minoritized', 'Student of Color', 'Transfer Student', 'Veteran', 'Working Student'];

export default function BarChart ({ interviewData, showLegend = false }) {
    const [labels, setLabels] = useState(fallbackLabels);
    const [chartData, setChartData] = useState(null);

    // allows legend to only be shown in dialog popup
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

    const themeColors = generateColors(interviewData.length);

    // Load identities from identities.txt
    useEffect(() => {
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
                const identities = text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));
                
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
    }, []);

    // Update chart data when labels are loaded
    useEffect(() => {
        if (labels.length > 0) {
            setChartData({
                labels,
                datasets: interviewData.map((item, index) => ({
                    label: item.theme,
                    // Map over labels to get values in the correct order
                    data: labels.map(label => item.identities[label] || 0),
                    backgroundColor: themeColors[index],
                })),
            });
        }
    }, [labels]);

    if (!chartData) {
        return <div>Loading chart...</div>;
    }

    return <Bar options={options} data={chartData} />
}

// https://react-chartjs-2.js.org/components/bar
// https://react-chartjs-2.js.org/examples/stacked-bar-chart