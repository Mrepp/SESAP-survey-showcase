import type { Analysis } from '@sesap/types';
import { currentPromptStamp, generateItemId } from '@sesap/core';

/** What the fixture provider reports as the model that produced this. */
export const FIXTURE_MODEL = 'fixture:@sesap/dev-fixtures';

/**
 * A canned analysis of {@link FIXTURE_TRANSCRIPT_LONG}.
 *
 * Written to pass the real `AnalysisSchema` — theme titles and identity labels
 * come from the shipped enums, ids are minted by the same `generateItemId` the
 * LLM path uses, and it carries `currentPromptStamp`, so a fixture-seeded
 * record does not read as stale to the drift checker. If the schema gains a
 * required field, this stops validating, which is the point: the fixture is
 * held to the same contract as a real response.
 */
export function makeFixtureAnalysis(interviewId: string): Analysis {
  const id = (kind: string, index: number) => generateItemId(interviewId, kind, index);

  const timeline = [
    {
      id: id('timeline', 0),
      event: 'Enrolled at Oregon State University as a first-generation student',
      period: 'freshman fall',
      term: 'freshman_fall' as const,
      position: 0.03125,
      significance: 'Chose the school on affordability and proximity rather than fit.',
    },
    {
      id: id('timeline', 1),
      event: 'Failed an introductory computer science midterm',
      period: 'freshman winter',
      term: 'freshman_winter' as const,
      position: 0.09375,
      significance: 'The low point that nearly ended the major.',
    },
    {
      id: id('timeline', 2),
      event: 'A professor walked through the memory model in office hours',
      period: 'freshman winter',
      term: 'freshman_winter' as const,
      position: 0.09375,
      significance: 'Turned asking for help from an admission of failure into a habit.',
    },
    {
      id: id('timeline', 3),
      event: 'Ran a peer study group',
      period: 'sophomore year',
      term: 'sophomore_fall' as const,
      position: 0.28125,
      significance: 'Moved from receiving support to providing it.',
    },
    {
      id: id('timeline', 4),
      event: 'Worked two jobs instead of taking a summer internship',
      period: 'junior year',
      term: 'junior_summer' as const,
      position: 0.71875,
      significance: 'Paying for school displaced the experience employers expect.',
    },
    {
      id: id('timeline', 5),
      event: 'Graduated and started work as a backend engineer',
      period: 'after graduation',
      term: 'post_college' as const,
      position: 1.15,
      significance: 'The outcome the whole trajectory was aimed at.',
    },
  ];

  const themes = [
    {
      id: id('theme', 0),
      title: 'Academic Difficulty' as const,
      description:
        'The introductory sequence moved faster than a student with no prior programming background could follow, and a failed midterm nearly ended the major.',
      category: 'academic',
      frequency: 4,
      relatedQuoteIds: [id('quote', 0), id('quote', 1)],
    },
    {
      id: id('theme', 1),
      title: 'Faculty Support' as const,
      description:
        'One hour of office-hours attention did what a term of lectures had not, and reset the student’s relationship to asking for help.',
      category: 'academic',
      frequency: 3,
      relatedQuoteIds: [id('quote', 1), id('quote', 2)],
    },
    {
      id: id('theme', 2),
      title: 'Financial Struggles' as const,
      description:
        'Two jobs most terms covered tuition but consumed the time an internship search would have taken.',
      category: 'financial',
      frequency: 3,
      relatedQuoteIds: [id('quote', 3)],
    },
    {
      id: id('theme', 3),
      title: 'Career Preparation' as const,
      description:
        'Career services assumed an unpaid summer was available to everyone, an assumption never stated and not true for this student.',
      category: 'career',
      frequency: 2,
      relatedQuoteIds: [id('quote', 3), id('quote', 4)],
    },
    {
      id: id('theme', 4),
      title: 'Personal Growth' as const,
      description:
        'The arc from a student who would not ask a question to one running a study group.',
      category: 'personal',
      frequency: 3,
      relatedQuoteIds: [id('quote', 2)],
    },
  ];

  const quotes = [
    {
      id: id('quote', 0),
      quoteText:
        'The intro sequence moved fast and I had never written code before. I failed a midterm and seriously thought about switching majors.',
      context: 'Describing the first year in the major.',
      sentiment: 'negative' as const,
      significanceLevel: 'high' as const,
      tags: ['academic', 'first-year', 'persistence'],
      themeIds: [themes[0].id],
      timelineEventId: timeline[1].id,
    },
    {
      id: id('quote', 1),
      quoteText:
        'One professor sat with me for an hour and drew the whole memory model on a whiteboard.',
      context: 'The turning point in the first year.',
      sentiment: 'positive' as const,
      significanceLevel: 'high' as const,
      tags: ['academic', 'mentorship', 'faculty'],
      themeIds: [themes[0].id, themes[1].id],
      timelineEventId: timeline[2].id,
    },
    {
      id: id('quote', 2),
      quoteText: 'I stopped treating asking for help as an admission of failure.',
      context: 'On what changed after that office-hours conversation.',
      sentiment: 'positive' as const,
      significanceLevel: 'high' as const,
      tags: ['personal', 'mentorship'],
      themeIds: [themes[1].id, themes[4].id],
      timelineEventId: timeline[3].id,
    },
    {
      id: id('quote', 3),
      quoteText:
        'Two jobs most terms — dining hall in the mornings, tutoring at night. It paid for school but it cost me the internship search my junior year.',
      context: 'On working while enrolled.',
      sentiment: 'mixed' as const,
      significanceLevel: 'high' as const,
      tags: ['financial', 'career', 'work'],
      themeIds: [themes[2].id, themes[3].id],
      timelineEventId: timeline[4].id,
    },
    {
      id: id('quote', 4),
      quoteText:
        'For a working student that is not a real option, and nobody ever said so out loud.',
      context: 'On career services assuming an unpaid summer internship was available.',
      sentiment: 'negative' as const,
      significanceLevel: 'medium' as const,
      tags: ['career', 'equity'],
      themeIds: [themes[3].id],
    },
  ];

  return {
    interviewId,
    modelConfig: { model: FIXTURE_MODEL, temperature: 0, maxTokens: 8192 },
    summaries: [
      {
        id: id('summary', 0),
        summaryText:
          'A first-generation computer science student chose Oregon State University on affordability, nearly left the major after a failed introductory midterm, and stayed because of one faculty conversation.',
        category: 'academic',
        confidence: 0.92,
      },
      {
        id: id('summary', 1),
        summaryText:
          'Working two jobs through most terms covered tuition but displaced the internship search, which the student names as their main regret.',
        category: 'financial',
        confidence: 0.88,
      },
      {
        id: id('summary', 2),
        summaryText:
          'The student moved from avoiding office hours to running a peer study group, and describes that shift as the durable change college produced.',
        category: 'personal',
        confidence: 0.85,
      },
      {
        id: id('summary', 3),
        summaryText:
          'Career services is criticized for an unstated assumption that an unpaid summer internship is available to every student.',
        category: 'career',
        confidence: 0.8,
      },
    ],
    timeline,
    themes,
    quotes,
    areasForImprovement: [
      {
        id: id('area', 0),
        area: 'Paid internship pathways',
        description:
          'Career services presumed an unpaid summer was possible. Funded or in-term placements would make the same pathway available to students working through school.',
        category: 'career',
        priority: 'high' as const,
      },
      {
        id: id('area', 1),
        area: 'Introductory sequence pacing',
        description:
          'The first programming course assumed prior exposure, which put students without it at an early and avoidable disadvantage.',
        category: 'academic',
        priority: 'high' as const,
      },
      {
        id: id('area', 2),
        area: 'Normalizing office hours',
        description:
          'The student read asking for help as failure until a professor intervened. Making office hours a stated expectation would not depend on that intervention happening.',
        category: 'academic',
        priority: 'medium' as const,
      },
    ],
    identities: [
      {
        label: 'First-Generation' as const,
        confidence: 1,
        evidence: "I'm the first in my family to go to college.",
      },
      {
        label: 'Working Student' as const,
        confidence: 1,
        evidence: 'Two jobs most terms — dining hall in the mornings, tutoring at night.',
      },
    ],
    demographics: {
      college: 'Oregon State University',
      graduationYear: '2024',
      major: 'Computer Science',
      // gender and ethnicity are absent: the transcript never states them, and
      // the real extraction is instructed to return null rather than guess.
    },
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...currentPromptStamp,
  };
}
