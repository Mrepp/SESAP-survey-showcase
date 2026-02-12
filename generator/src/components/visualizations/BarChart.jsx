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
import { useState, useEffect } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const interviewData = [{theme: 'Academic Difficulty', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Belonging', identities: {Disabled: 13, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Career Preparation', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Cultural Representation', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Faculty Support', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Family Pressure', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Financial Struggles', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Identity & Discrimination', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Mental Health', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Language Barriers', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 5, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Peer Relationships', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Personal Growth', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Support Networks', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
        {theme: 'Work-Life Balance', identities: {Disabled: 1, 'First-Generation': 2, Immigrant: 3, 'International Student': 4, 'LGBTQ+': 5, 'Low-Income': 6, 'Non-Traditional Age': 7, Parent: 8, Religious: 9, Rural: 10, 'STEM Minoritized': 11, 'Student of Color': 12, 'Transfer Student': 13, Veteran: 14, 'Working Student': 14}},
]

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

const themeColors = generateColors(interviewData.length);

const options = {
    indexAxis: 'y', // makes the bar chart horizontal
    plugins: {
        title: {
            display: true,
            text: 'Theme Frequency by Identity',
        },
        legend: {
            position: 'right'
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

export default function BarChart () {
    const [labels, setLabels] = useState(fallbackLabels);
    const [chartData, setChartData] = useState(null);

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