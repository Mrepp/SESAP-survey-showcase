// Demographics information for the interviewee
export interface Demographics {
  age: string;
  gender: string;
  major: string;
  year: string;
  other: string;
}

// Transcript and validation information
export interface Transcript {
  fileName: string;
  fileType: string;
  rawText: string;
  wordCount: number;
  validation: {
    minimumLengthCheck: {
      passed: boolean;
      warningIssued: boolean;
      overrideApprovedBy: string;
    };
  };
}

// Analysis model configuration
export interface AnalysisModel {
  provider: string;
  modelName: string;
  temperature: number;
  promptVersion: string;
  promptTemplateId: string;
}

// Category-based summaries
export interface Summary {
  category: string;
  title: string;
  summaryText: string;
  embedding?: number[];
}

// Timeline points with temporal context
export interface TimelinePoint {
  eventDescription: string;
  timeframeType: string;
  category: string;
  sentiment: string;
  embedding?: number[];
}

// Thematic patterns identified across the interview
export interface Theme {
  themeId: string;
  title: string;
  description: string;
  frequency: number;
  impactScore: number;
  actionable: boolean;
  category: string;
  relatedQuoteIds: string[];
  embedding?: number[];
}

// Significant quotes from the interview
export interface Quote {
  quoteId: string;
  quoteText: string;
  context: string;
  timestamp: string;
  tags: string[];
  sentiment: string;
  significanceLevel: string;
  relatedThemeIds: string[];
  embedding?: number[];
}

// Areas identified for improvement
export interface AreaForImprovement {
  areaId: string;
  title: string;
  description: string;
  priority: string;
  stakeholders: string[];
  actionItems: string[];
  embedding?: number[];
}

// Complete analysis structure
export interface Analysis {
  model: AnalysisModel;
  summaries: Summary[];
  timelinePoints: TimelinePoint[];
  themes: Theme[];
  quotes: Quote[];
  areasForImprovement: AreaForImprovement[];
}

// Metadata about the interview record
export interface Metadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  source: string;
  validatedBy: string;
  accuracyScore?: number; // Accuracy Score (1-10)
  sesapAlignmentScore?: number; // SESAP Mission Alignment Score (1-10)
  editDiffScore?: number; // Character change percentage from edits
}

// Main interview interface
export interface Interview {
  interviewId: string;
  intervieweeName: string;
  interviewDate: string;
  interviewFormat: string;
  interviewerName: string;
  demographics: Demographics;
  transcript: Transcript;
  analysis: Analysis;
  status: 'pending' | 'in-progress' | 'completed';
  metadata: Metadata;
}

export interface QueueStats {
  pending: number;
  completed: number;
}
