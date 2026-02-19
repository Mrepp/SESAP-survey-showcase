export interface LLMModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface Summary {
  id: string;
  summaryText: string;
  category: string;
  confidence: number;
}

export interface TimelinePoint {
  id: string;
  event: string;
  period: string;
  significance: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: number;
  impactScore?: number;
  actionable?: boolean;
  relatedQuoteIds: string[];
}

export interface Quote {
  id: string;
  quoteText: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  tags: string[];
  themeIds: string[];
  timestamp?: string;
  significanceLevel?: 'high' | 'medium' | 'low';
}

export interface AreaForImprovement {
  id: string;
  area: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title?: string;
  stakeholders?: string[];
  actionItems?: string[];
}

export interface Analysis {
  interviewId: string;
  modelConfig: LLMModelConfig;
  summaries: Summary[];
  timeline: TimelinePoint[];
  themes: Theme[];
  quotes: Quote[];
  areasForImprovement: AreaForImprovement[];
  generatedAt: string;
}
