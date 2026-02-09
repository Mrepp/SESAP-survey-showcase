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
import { faker } from '@faker-js/faker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const options = {
    indexAxis: 'y',
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

// labels loaded from identities.txt
// Text file provides an easy way to change/add to identities from one place
// Identity labels are hard coded as back up in case fails to load txt file
const labels = ['Disabled', 'First-Generation', 'Immigrant', 'International Student', 'LGBTQ+', 'Low-Income', 'Non-Traditional Age', 'Parent', 'Religious', 'Rural', 'STEM Minoritized', 'Student of Color', 'Transfer Student', 'Veteran', 'Working Student'];

const data = {
    labels,
    datasets: [
        {
            label: 'Dataset 1',
            data: labels.map(() => faker.number.float({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(255, 99, 132)',
        },
        {
            label: 'Dataset 2',
            data: labels.map(() => faker.number.float({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(75, 192, 192)',
        },
        {
            label: 'Dataset 3',
            data: labels.map(() => faker.number.float({ min: 0, max: 1000 })),
            backgroundColor: 'rgb(53, 162, 235)',
        },
    ],
};

/*const data = [{identity: 'Disabled', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'First-Generation', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Immigrant', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'International Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'LGBTQ+', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Low-Income', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 1, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Non-Traditional Age', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Parent', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Religious', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Rural', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'STEM Minoritized', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Student of Color', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Transfer Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
        {identity: 'Veteran', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},    
        {identity: 'Working Student', themes: {academicDifficulty: 1, belonging: 2, careerPrepartion: 3, culturalRepresentation: 4, facultySupport: 5, familyPressure: 6, financialStruggles: 7, identityDiscrimination: 8, mentalHealth: 9, languageBarriers: 10, peerRelationships: 11, personalGrowth: 12, supportNetworks: 13, workLifeBalance: 14}},
]*/

export default function BarChart () {
    return <Bar options={options} data={data} />
}