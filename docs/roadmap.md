# Roadmap to launch and hand off the SESAP site

**Goal:** Bring the full SESAP site onto a stable public domain, bring `main` up to date with the work that is ready to ship, make the contributor and staff journeys usable, and give the SESAP project partner and teammates a working site and materials to verify and decide what to publish, transfer, revise, retain, or dispose of. A complete outcome also includes an agreed path for approved materials to reach the OSU Library.

**This is a working plan, not a launch claim.** The local repository was reviewed September 24, 2026. The branch contains work that is not in `main`; the current CI and deployment workflows do not include the intake worker; the contributor consent text is still marked as draft; and a library deposit mechanism is not present. Confirm product, form, domain, and handoff decisions with the project partner and SESAP teammates before inviting real contributors.

## What “ready” looks like

- A visitor can reach the public showcase through a real SESAP domain, understand the project, search and view approved stories, and find a way to contact the project.
- A contributor can understand the invitation, complete the approved forms, submit a recording, review the resulting draft, and understand each decision and next step.
- SESAP reviewers can check submissions, approve or return them, publish approved work, and prepare the materials required for OSU Library transfer.
- The project partner and SESAP teammates can review the public site, the contributor journey, and a sample library package; record corrections; and make an explicit launch and materials disposition decision.
- The code that runs in production is traceable to `main`, with a repeatable deployment, working domain, smoke checks, and a rollback path.

## Sequence

### 1. Reconcile the branches and make staging representative

**Do:** Inventory the uncommitted work on this branch and the changes on `main` and `staging`. Integrate the needed `main` changes here, resolve conflicts deliberately, and review the resulting diff. Make the CI and deployment workflows build, test, deploy, and smoke-check the intake worker alongside admin, processing, indexing, and showcase. Update the release instructions so they describe all five workers and the actual path from feature branch to staging to `main`. Keep staging resources and data separate from production.

**Exit check:** The complete five-worker flow deploys from a known commit to staging. CI passes; staging smoke checks cover the public site, intake, admin, processing, and publication. The same commit can be promoted to `main` after review without reconstructing changes by hand.

### 2. Put the site on its intended domain

**Do:** Confirm the public domain and the addresses for the showcase, contributor intake, and staff admin area with the project partner and SESAP teammates. Configure DNS, HTTPS, Cloudflare routes/custom domains, and the corresponding application URLs. Check that email links, review links, media playback, cross-site requests, and redirects use those addresses. Keep the admin area behind its intended access control and verify the sending domain for contributor email. Document who can change DNS, Cloudflare settings, email configuration, and secrets; record a safe rollback procedure.

**Exit check:** Each intended address loads over HTTPS, links and emails return to the right site, admin access works only for authorized reviewers, and a deployment can be rolled back. The project partner can verify the site at the addresses contributors will actually use.

### 3. Finish the public site and contributor journey

**Public site:** Review the landing page, about text, search, interview pages, media, captions, mobile layout, and contact information as one visitor journey. Remove outdated claims and check that only approved material is public.

**Self intake:** Compare the current wizard with the approved Qualtrics questions and the example self submission. The supplied forms key does not contain the Qualtrics question text, so obtain the current question export before recreating it. Replace draft consent with the agreed SESAP permissions and OSU Library release; keep the agreements separate where their rights differ. Complete the biographical questions, preparation prompt, save/resume behavior, receipt or copy of completed forms, and clear submission status. Do not invite real contributors while draft consent is shown.

**Review:** Preserve the staff media gate before analysis. Let contributors check the public draft and request transcript corrections, then return it to SESAP for a final decision. Check that the website and emails describe the same sequence and do not claim immediate publication or library acceptance.

**Exit check:** A first-time visitor can find an approved story, and a first-time test contributor can finish the journey on phone and desktop without guided help. Staff can see whether forms, media, review, and publication are complete. The project partner and SESAP teammates confirm the wording and forms.

### 4. Prepare OSU Library materials and disposition decisions

**Do:** Agree on SCARC's accepted release, signatures, file formats, metadata, and transfer route. For each approved submission, assemble the agreed original media or Kaltura export, reviewed transcript or captions, bio/description, completed releases, and a manifest. Give SESAP a private preview and a deliberate action to send the package. Record what was sent, when, the package version, and SCARC's acknowledgement or requested correction. Keep **approved for the SESAP site**, **sent to the library**, and **accepted by the library** as separate states.

Also agree how test, rejected, withdrawn, duplicate, and superseded materials are handled. Record the project partner's disposition decision before keeping, transferring, or disposing of material. The existing code can delete an interview while retaining a withdrawn consent record, but it does not implement a general retention schedule; that policy and its technical implementation need confirmation.

**Exit check:** A sample package is accepted through the agreed handoff process, its receipt is recorded, and the team can demonstrate what happens when SCARC requests a correction or SESAP decides material should not be published or retained.

### 5. Verify with the partner, update `main`, and launch

**Do:** Run an end-to-end rehearsal on staging with test material: public browsing, email verification, form completion, recording/upload, staff review, contributor review, approval, indexing, and library package preparation. Include failed upload, missing form, requested revision, rejected submission, and rollback. Walk the site with someone unfamiliar with it and ask them to explain what happens to their story and when. Give the project partner and SESAP teammates the staging URLs, a short review script, sample outputs, and a place to record findings. Fix the findings and repeat the affected checks.

Once the partner and teammates verify the result and decide what may go live, merge the reviewed work into `main` through the normal review path. Deploy production to the real domain, run smoke checks there, and verify the first approved record and any agreed OSU Library transfer. Hand over a short operating guide covering access, daily review, publication, corrections, support, data disposition, and recovery.

**Exit check:** The partner and teammates explicitly accept the site and its content/forms for launch; production matches the reviewed commit; the domain, contributor emails, admin access, and public showcase work; and the handoff materials are usable without relying on undocumented developer knowledge.

## Decisions to confirm together

| Decision | Why it matters |
| --- | --- |
| Canonical public domain and separate intake/admin addresses | The repository has URL settings but no verified domain setup. |
| Which branch changes belong in the next release | `main`, `staging`, and this working branch have diverged. |
| Exact Qualtrics questions, releases, and publication language | Draft site consent cannot stand in for approved project and library forms. |
| When a story may appear on the site relative to library transfer | Site approval and SCARC acceptance are different decisions. |
| Who receives the working site and how they record verification findings | Partner review should end in a clear decision, not an informal handoff. |
| What happens to rejected, test, withdrawn, and superseded material | Current deletion behavior does not establish a complete retention or disposal policy. |

## Contributor check before invitations

Walk through the site with someone who has not worked on it. Ask them to explain, in their own words, what they agree to, when the recording is reviewed, what they can correct, when it may appear on the SESAP site, and when it may reach the OSU Library. Watch them use a phone and a desktop without guiding them. Compare the screens and emails against that explanation. Revise any point that creates confusion or promises an outcome the project has not approved.
