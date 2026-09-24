# Partner staging verification

Use this script with the project partner and SESAP teammates on staging, with test material and approved test accounts. It is a review aid, not a claim that staging or final forms are ready. Use [operations](operations.md) for staff procedures, [deployment](deployment.md) for release evidence, and [roadmap](roadmap.md) for launch gates.

Before the session, give reviewers the reviewed commit SHA, staging URLs, an authorized admin account, a test contributor inbox, and one test media sample through an approved private channel. Record the consent version shown in the wizard and compare it with the project approved source. If it remains `draft-*`, stop before a real contributor invitation.

| Step | Reviewer action | Evidence to record |
| --- | --- | --- |
| Public site | Open landing page, search an approved story, inspect media and captions on phone and desktop | URLs, screenshots or notes, accessibility and wording findings |
| Intake | Verify the test inbox, complete profile and forms, record or upload, resume if interrupted, submit | Receipt/status, wording and email behavior, test record ID |
| Media gate | Staff open private media, decide approve or reject before analysis | Decision, reason, media access result |
| Processing | For an approved test item, watch status and any failure/retry | Final status, timing, error details if any |
| Draft review | Open contributor link, correct draft, submit it back to staff | Review state and whether corrections persisted |
| Publication | Staff make final decision, run build, inspect public page | Decision, build ID, visible result and attribution |
| Exceptions | Try failed upload, missing form, requested revision, rejected item, and a correction to a published test item | Expected and actual behavior, owner for each finding |
| Library rehearsal | Inspect a sample private package and manifest against SCARC requirements | Missing items, transfer route decision, acknowledgement plan |
| Recovery | Walk through deployment rollback and access handoff with the responsible staff | Last accepted commit, owners, access gaps |

Ask a reviewer unfamiliar with the site to explain when media is examined, what they can correct, when a story becomes public, and whether library acceptance follows automatically. Capture every place they needed verbal help. Do not treat the automated smoke suite as evidence for these human steps.

Keep a findings log in the team's approved private system: ID, environment and commit, step, expected result, actual result, severity, owner, resolution, retest evidence, and status. Close or explicitly accept each finding before a decision. End with a dated decision record naming the partner and SESAP reviewers, the accepted commit and content/forms, unresolved conditions, site launch decision, material disposition decisions, and the next post handoff check date. After handoff, have a designated teammate repeat an admin review and a public page check without developer assistance.
