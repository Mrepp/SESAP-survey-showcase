/**
 * Canned transcripts. `FIXTURE_TRANSCRIPT` is the text of
 * `tests/fixtures/interview1.txt`, inlined rather than read from disk so a
 * worker can use it — there is no filesystem inside workerd.
 */
export const FIXTURE_TRANSCRIPT = [
  'Interviewer: Thanks for joining me today. Could you start by telling us a little about your background?',
  '',
  'Participant: Sure. I grew up in x and studied computer science at Oregon State University. ',
  '',
  'Interviewer: What inspired you to pursue software development?',
  '',
  'Participant: I love building tools',
  '',
  'Interviewer: What projects are you most proud of?',
  '',
  'Participant: Recently, I built a wall',
  '',
  'Interviewer: What are your future goals?',
  '',
  'Participant: I hope to work ',
].join('\n');

/**
 * A longer transcript, used where the short one is too thin to be interesting —
 * the seeded approved interview the showcase renders, for instance.
 */
export const FIXTURE_TRANSCRIPT_LONG = [
  'Interviewer: Thanks for making the time. Tell me how you ended up at Oregon State University.',
  '',
  "Participant: I'm the first in my family to go to college, so honestly I picked it because it",
  'was the school I could afford and drive home from. I started in Fall 2020 in Computer Science.',
  '',
  'Interviewer: What was that first year like?',
  '',
  'Participant: Hard. The intro sequence moved fast and I had never written code before. I failed a',
  'midterm and seriously thought about switching majors. What changed it was office hours — one',
  'professor sat with me for an hour and drew the whole memory model on a whiteboard.',
  '',
  'Interviewer: Did that change how you approached the rest of the program?',
  '',
  'Participant: Completely. I stopped treating asking for help as an admission of failure. By',
  'sophomore year I was the one running a study group.',
  '',
  'Interviewer: You mentioned working while enrolled.',
  '',
  'Participant: Two jobs most terms — dining hall in the mornings, tutoring at night. It paid for',
  'school but it cost me the internship search my junior year, which I still think about.',
  '',
  'Interviewer: What would you change about the program?',
  '',
  'Participant: Career services assumed everyone could take an unpaid summer internship. For a',
  'working student that is not a real option, and nobody ever said so out loud.',
  '',
  'Interviewer: Where did you land?',
  '',
  'Participant: I graduated in 2024 and I work as a backend engineer now. I still keep in touch',
  'with that professor.',
].join('\n');

/** Every canned transcript, addressable by a stable key. */
export const FIXTURE_TRANSCRIPTS: Record<string, string> = {
  interview1: FIXTURE_TRANSCRIPT,
  long: FIXTURE_TRANSCRIPT_LONG,
};
