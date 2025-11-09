import { Interview } from '../types/interview';

export const sampleInterviews: Interview[] = [
  {
    id: 'sample-1',
    rawTranscript: `I've been using your product for about 3 months now. Initially, I found the onboarding process a bit confusing because there weren't clear instructions on how to set up my profile. However, once I got past that, the interface became really intuitive. The feature I use most is the dashboard analytics - it's saved me hours of manual reporting. One thing that frustrates me is the mobile app crashes occasionally when I try to export data. Overall, I'd say it's been a positive experience and has improved my workflow significantly.`,
    originalJson: {
      sentiment: "positive",
      painPoints: [
        "Confusing onboarding process",
        "Mobile app crashes during data export"
      ],
      positiveAspects: [
        "Intuitive interface after initial setup",
        "Dashboard analytics feature",
        "Improved workflow efficiency"
      ],
      keyFeatures: ["dashboard analytics", "data export"],
      timeUsing: "3 months",
      overallSatisfaction: 8
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    rawTranscript: `The customer support team has been phenomenal. Every time I've reached out with a question, they respond within an hour. The documentation could use some work though - I often find myself searching multiple pages to find what I need. The pricing is fair for what you get, but I wish there was a mid-tier option between the basic and premium plans. The collaboration features are what sold me on the product. Being able to share projects with my team in real-time has been a game changer.`,
    originalJson: {
      sentiment: "positive",
      painPoints: [
        "Documentation needs improvement",
        "Lack of mid-tier pricing option"
      ],
      positiveAspects: [
        "Excellent customer support response time",
        "Fair pricing",
        "Real-time collaboration features"
      ],
      keyFeatures: ["customer support", "collaboration", "project sharing"],
      timeUsing: "unknown",
      overallSatisfaction: 7
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    rawTranscript: `I'm disappointed with the recent updates. Features that used to work smoothly are now buggy. The new UI design looks modern but it's less functional - I have to click through more menus to get to the tools I use daily. I've also noticed the app has become slower, especially when loading large datasets. I'm considering switching to a competitor if these issues aren't resolved soon. The only reason I'm still here is because of the data migration hassle.`,
    originalJson: {
      sentiment: "negative",
      painPoints: [
        "Buggy features after updates",
        "Less functional UI design",
        "Slower performance with large datasets",
        "Increased clicks to access daily tools"
      ],
      positiveAspects: [],
      keyFeatures: ["UI design", "large dataset handling"],
      timeUsing: "unknown",
      overallSatisfaction: 3
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];