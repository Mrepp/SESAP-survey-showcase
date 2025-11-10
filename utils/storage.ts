import { Interview } from '../types/interview';
import { sampleInterviews } from '../data/sampleInterviews';

const STORAGE_KEY = 'interview-review-data';
const INIT_KEY = 'interview-review-initialized';

export const storage = {
  getInterviews(): Interview[] {
    if (typeof window === 'undefined') return [];

    // Check if first visit
    const initialized = localStorage.getItem(INIT_KEY);
    if (!initialized) {
      localStorage.setItem(INIT_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleInterviews));
      return sampleInterviews;
    }

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const interviews = JSON.parse(data);

    // Migration: Clear old schema data and reset to new sample interviews
    const hasOldSchema = interviews.some((i: Interview) =>
      !i.interviewId || !i.demographics || !i.analysis
    );

    if (hasOldSchema) {
      console.log('Migrating to new schema - resetting to sample interviews');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleInterviews));
      return sampleInterviews;
    }

    return interviews;
  },

  saveInterviews(interviews: Interview[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
    // Dispatch custom event to notify components of the update
    window.dispatchEvent(new Event('interviewsUpdated'));
  },

  addInterview(interview: Interview): void {
    const interviews = this.getInterviews();
    interviews.push(interview);
    this.saveInterviews(interviews);
  },

  updateInterview(id: string, updates: Partial<Interview>): void {
    const interviews = this.getInterviews();
    const index = interviews.findIndex(i => i.interviewId === id);
    if (index !== -1) {
      interviews[index] = {
        ...interviews[index],
        ...updates,
        metadata: {
          ...(interviews[index].metadata || {}),
          ...(updates.metadata || {}),
          updatedAt: new Date().toISOString()
        }
      };
      this.saveInterviews(interviews);
    }
  },

  deleteInterview(id: string): void {
    const interviews = this.getInterviews();
    const filtered = interviews.filter(i => i.interviewId !== id);
    this.saveInterviews(filtered);
  },
};