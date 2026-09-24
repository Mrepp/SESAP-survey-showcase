# SESAP operations and materials handoff

Use test material until the partner and SESAP teammates approve the contributor language and release process. The wording currently shown by intake is the [draft product source](../packages/core/src/consent/consent-text.ts); this guide does not replace an approved release. Staff actions use the Access protected admin dashboard. The [architecture](architecture.md) explains worker boundaries, and [partner verification](partner-verification.md) provides the staging rehearsal.

## Review and publication

1. In the admin dashboard, filter for **Awaiting Media Review**. Open each self submission and play its private media. Approve for analysis only when suitable; otherwise use **Reject before analysis** with a reason. That rejection deletes submitted media and queues a contributor notification.
2. Watch dashboard processing status. The monitoring routes report failed or stuck work; use the record's retry action after diagnosing the cause. Check queue and worker logs for repeated failures. Do not approve incomplete analysis as a workaround.
3. After processing, the contributor receives a draft review link. Their submitted corrections return the record to **Pending Review**. Review the text, attribution, and analysis in the admin detail screen. A staff rejection of a self submission may return it for another contributor revision within the coded limit; record the requested change clearly. Terminal rejection is a separate outcome.
4. Approve a record only after the current forms and publication decision are verified. Approval marks the public build dirty. Trigger **Build** from the dashboard, read any missing or dropped item warning, then check the public story. Site approval, build publication, library dispatch, and library acceptance are separate decisions.

Staff can also upload a transcript, audio, or Kaltura source from admin. That path does not use the contributor wizard or its draft review link; confirm the appropriate release and review basis before publication. [Testing](testing.md) describes what automation covers.

## Corrections, withdrawal, and support

For a published correction, verify the request and affected record, edit the draft in admin, save, rebuild, and check the public page. For a withdrawal, first confirm identity and scope with the designated SESAP decision maker, then remove the record through admin and rebuild. Record what was removed and whether copies or downstream transfers also need action. The code can retain a withdrawn consent archive after record deletion; it does not implement a general retention schedule. Do not promise complete deletion or library recall from the current UI alone.

When processing fails, log the record ID, stage, error, time, and chosen retry or manual action. When a contributor cannot verify email, check delivery configuration and rate limits without copying codes or personal details into a public issue. Keep support findings in an access controlled channel approved by SESAP. See [deployment](deployment.md) for infrastructure and rollback.

## Library and disposition

OSU Library transfer is **planned**. The current approval action neither creates a deposit package nor submits one. With SCARC and the project partner, agree on release text, required signatures, media and transcript formats, metadata, transfer route, acknowledgement, correction loop, and who may access each material. For each approved item, prepare the agreed original media or export, reviewed transcript or captions, bio/description, completed releases, and manifest in the approved private location. Record package version, dispatch, acknowledgement, and any requested correction separately from website publication. See [the roadmap](roadmap.md) for the product gate.

Record a disposition decision for test, rejected, withdrawn, duplicate, and superseded material before retaining, transferring, or deleting it. Until SESAP approves a schedule, do not infer one from storage behavior. A small record can use this template in the team's approved private system:

| Field | Value to record |
| --- | --- |
| Record/package ID and category | Test, rejected, withdrawn, duplicate, or superseded |
| Decision and basis | Retain, transfer, correct, or dispose; policy reference |
| Decision maker and date | Named authorized person and date |
| Affected locations | Site, R2/KV, backups, email, library package |
| Action and evidence | Operator, completion time, receipt or deletion evidence |
| Follow up | Owner, due date, and acknowledgement |

At handoff, grant the partner and SESAP teammates the agreed Cloudflare, GitHub, DNS, email, and private materials access through their normal account process. Verify that at least two designated people can review submissions, rebuild the site, inspect deployment failures, and locate the disposition record. Record ownership and recovery contacts privately; no credentials belong in this repository.
