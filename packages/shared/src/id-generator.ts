import { nanoid } from 'nanoid';

export function generateInterviewId(): string {
  return `int_${nanoid(12)}`;
}

export function generateBuildId(): string {
  return `build_${nanoid(12)}`;
}

export function generateItemId(interviewId: string, type: string, index: number): string {
  return `${interviewId}_${type}_${index}`;
}
