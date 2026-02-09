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
  import { useState, useEffect } from 'react'
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  )
  
  export const options = {
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
      const [labels, setLabels] = useState([]);
      const [chartData, setChartData] = useState(null);
  
      // Load identities from identities.txt
      useEffect(() => {
          async function loadIdentities() {
              try {
                  const response = await fetch('/identities.txt');
                  if (!response.ok) {
                      console.warn('Failed to load identities.txt, using fallback labels');
                      setLabels(['Disabled', 'First-Generation', 'Immigrant', 'International Student', 'LGBTQ+', 'Low-Income', 'Non-Traditional Age', 'Parent', 'Religious', 'Rural', 'STEM Minoritized', 'Student of Color', 'Transfer Student', 'Veteran', 'Working Student']);
                      return;
                  }
                  const text = await response.text();
                  // Parse identities: split by newline, trim whitespace, filter out empty lines
                  const identities = text
                      .split('\n')
                      .map(line => line.trim())
                      .filter(line => line && !line.startsWith('#'));
                  setLabels(identities);
              } catch (error) {
                  console.warn('Error loading identities:', error);
                  setLabels(['Disabled', 'First-Generation', 'Immigrant', 'International Student', 'LGBTQ+', 'Low-Income', 'Non-Traditional Age', 'Parent', 'Religious', 'Rural', 'STEM Minoritized', 'Student of Color', 'Transfer Student', 'Veteran', 'Working Student']);
              }
          }
          loadIdentities();
      }, []);
  
      // Update chart data when labels are loaded
      useEffect(() => {
          if (labels.length > 0) {
              setChartData({
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
              });
          }
      }, [labels]);
  
      if (!chartData) {
          return <div>Loading chart...</div>;
      }
  
      return <Bar options={options} data={chartData} />
  }