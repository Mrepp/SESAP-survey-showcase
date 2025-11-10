# SESAP Interview Review System

A human-in-the-loop review system for validating and improving LLM-analyzed student interview transcripts at Oregon State University's SESAP program.

## Overview

An interface for reviewing interview transcripts that have been pre-analyzed LLMs. Human reviewers can validate, edit, and enhance the AI-generated analysis before finalizing the data with semantic embeddings for downstream use.

## Key Features

### Interview Management
- **Upload & Queue System**: Add interview transcripts with metadata through a modal interface
- **Dual Queue View**: Separate views for pending reviews and completed/verified interviews
- **Status Tracking**: Automatic progression through pending → in-progress → completed states

### Review Interface
- **Comprehensive Analysis Tabs**:
  - **Summaries**: Category-based interview summaries with titles and descriptions
  - **Timeline**: Chronological event tracking with sentiment analysis
  - **Themes**: Identified patterns with frequency, impact scores, and actionable flags
  - **Quotes**: Significant quotations with context, tags, and sentiment
  - **Improvements**: Areas for improvement with priority levels, stakeholders, and action items

- **In-line Editing**: Edit any analysis component directly within the review interface
- **Validation Checks**: Built-in validation for transcript length and schema compliance
- **Score Rating**: Rate analysis accuracy (1-10) and alignment to SESAP mission (1-10)

### Embedding Generation
- **Client-side Processing**: Uses `@xenova/transformers` to generate semantic embeddings locally
- **Batch Processing**: Generates embeddings for all analysis components upon review completion
- **Vector Search Ready**: Prepares data for similarity search and semantic analysis

### Data Persistence
- **Local Storage**: Browser-based storage using localStorage
- **Real-time Updates**: Automatic synchronization across components
- **Export Ready**: Structured JSON format for easy data export

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **UI Library**: [Material-UI (MUI) v7](https://mui.com/)
- **Styling**: Tailwind CSS v4
- **Embeddings**: [@xenova/transformers](https://github.com/xenova/transformers.js) for client-side ML
- **Language**: TypeScript
- **State Management**: React hooks with localStorage persistence

## Getting Started

### Prerequisites
- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
cd frontend-review

# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend-review/
├── components/           # React components
│   ├── AddInterviewModal.tsx    # Upload new interviews
│   ├── InterviewCard.tsx        # Interview display card
│   └── InterviewQueue.tsx       # Queue management
├── pages/               # Next.js pages
│   ├── index.tsx        # Main dashboard with dual queues
│   ├── review/[id].tsx  # Individual interview review page
│   └── _app.tsx         # App wrapper with MUI theme
├── types/
│   └── interview.ts     # TypeScript interfaces
├── utils/
│   ├── storage.ts       # localStorage abstraction
│   ├── embeddings.ts    # Embedding generation logic
│   └── diff.ts          # Diff calculation utilities
├── data/
│   └── sampleInterviews.ts  # Sample data
└── public/              # Static assets
```

## Sample Data

The application includes two mock interviews for demonstration purposes. When you first load the app, you'll see these sample interviews in the "Pending Review" queue.

### Importing Your Own Interviews

To add your own interview data:

1. Click the **"Add Interview"** button in the top right
2. Paste your JSON data that conforms to the schema below and the transcript data
3. Click **"Add Interview"** to import

The JSON should include both the interview transcript and the LLM-generated analysis. Embeddings will be generated automatically when you complete the review.

## Data Schema

The system expects interview data in the following JSON structure:

```json
{
  "interviewId": "",
  "intervieweeName": "",
  "interviewDate": "",
  "interviewFormat": "",
  "interviewerName": "",
  "demographics": {
    "age": "",
    "gender": "",
    "major": "",
    "year": "",
    "other": ""
  },
  "transcript": {
    "fileName": "",
    "fileType": "",
    "rawText": "",
    "wordCount": 0,
    "validation": {
      "minimumLengthCheck": {
        "passed": false,
        "warningIssued": false,
        "overrideApprovedBy": ""
      }
    }
  },
  "analysis": {
    "model": {
      "provider": "OpenRouter",
      "modelName": "",
      "temperature": 0.7,
      "promptVersion": "",
      "promptTemplateId": ""
    },
    "summaries": [
      {
        "category": "",
        "title": "",
        "summaryText": "",
        "embedding": []
      }
    ],
    "timelinePoints": [
      {
        "eventDescription": "",
        "timeframeType": "",
        "category": "",
        "sentiment": "",
        "embedding": []
      }
    ],
    "themes": [
      {
        "themeId": "",
        "title": "",
        "description": "",
        "frequency": 0,
        "impactScore": 0,
        "actionable": false,
        "category": "",
        "relatedQuoteIds": [],
        "embedding": []
      }
    ],
    "quotes": [
      {
        "quoteId": "",
        "quoteText": "",
        "context": "",
        "timestamp": "",
        "tags": [],
        "sentiment": "",
        "significanceLevel": "",
        "relatedThemeIds": [],
        "embedding": []
      }
    ],
    "areasForImprovement": [
      {
        "areaId": "",
        "title": "",
        "description": "",
        "priority": "",
        "stakeholders": [],
        "actionItems": [],
        "embedding": []
      }
    ]
  },
  "metadata": {
    "createdAt": "",
    "updatedAt": "",
    "version": "1.0",
    "source": "manual-upload",
    "validatedBy": ""
  }
}
```

**Note**: The `embedding` arrays should be left empty (`[]`) when importing. Embeddings are automatically generated on the client-side when you complete the review process.

See [types/interview.ts](types/interview.ts) for the complete TypeScript type definitions.

## Workflow

1. **Upload**: Add interview data via the "Add Interview" button
2. **Review**: Click on an interview card to open the review interface
3. **Validate**: Review transcript, demographics, and model configuration
4. **Edit**: Modify any analysis component using the edit buttons
5. **Score**: Rate the accuracy and SESAP alignment
6. **Complete**: Generate embeddings and mark as verified
7. **Export**: Extract completed interviews from localStorage for downstream processing