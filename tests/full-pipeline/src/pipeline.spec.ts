import { test, expect, type Page } from '@playwright/test';
import {
  ADMIN_BASE,
  ADMIN_UI_BASE,
  SHOWCASE_BASE,
  SHOWCASE_UI_BASE,
  deleteInterview,
  getInterview,
  type InterviewRecord,
  pollProcessingStatus,
  requireKalturaSource,
  triggerBuild,
} from './helpers/api';

async function gotoWithRetry(page: Page, url: string) {
  const deadline = Date.now() + 120_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      return;
    } catch (e) {
      lastError = e;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Timed out navigating to ${url}`);
}

test('full pipeline: kaltura → real Whisper + LLM → edit → approve → showcase', async ({ page }) => {
  // Step 1 — Resolve the Kaltura source. Playwright webServer handles local server readiness.
  const kalturaSource = requireKalturaSource();

  const marker = `E2E-${Date.now()}`;
  const title = `E2E pipeline check ${marker}`;
  const editedInterviewer = `e2e-tester-${marker}`;
  let interviewId: string | null = null;

  try {
    // Step 2 — Submit Kaltura embed through the admin upload UI
    await gotoWithRetry(page, `${ADMIN_UI_BASE}/upload`);
    await expect(page.getByText('Upload New Interview')).toBeVisible({ timeout: 30_000 });
    const titleInput = page.locator('input[name="title"]');
    const dateInput = page.locator('input[name="interviewDate"]');
    const kalturaInput = page.locator('[name="interviewURL"]');
    const uploadButton = page.getByRole('button', { name: /^upload interview$/i });

    await expect(titleInput).toBeEnabled();
    await titleInput.fill(title);
    await dateInput.fill(new Date().toISOString().slice(0, 10));
    await kalturaInput.fill(kalturaSource);
    await expect(titleInput).toHaveValue(title);
    await expect(kalturaInput).toHaveValue(kalturaSource);
    await expect(uploadButton).toBeEnabled();

    const [uploadResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          new URL(res.url()).pathname === '/api/interviews' &&
          res.request().method() === 'POST' &&
          res.status() < 300,
      ),
      uploadButton.click(),
    ]);
    const uploadBody = (await uploadResponse.json()) as {
      success: boolean;
      data?: InterviewRecord;
      error?: { message?: string };
    };
    expect(
      uploadResponse.ok(),
      `Upload failed with HTTP ${uploadResponse.status()}: ${JSON.stringify(uploadBody)}`,
    ).toBe(true);
    expect(uploadBody.success, uploadBody.error?.message).toBe(true);
    const created = uploadBody.data;
    if (!created) {
      throw new Error('Upload succeeded but did not return an interview record');
    }
    interviewId = created.id;
    test.info().annotations.push({ type: 'interview-id', description: created.id });
    console.log(`[pipeline] created interview ${created.id} with marker ${marker}`);

    await expect(page.getByText(title)).toBeVisible({ timeout: 30_000 });

    // Step 3 — Wait for real Kaltura fetch + Whisper + LLM analysis to complete
    await pollProcessingStatus(created.id, (s) => console.log(`[pipeline] status → ${s}`));

    // Step 4 — Open the review page from the dashboard and edit a review field
    await gotoWithRetry(page, ADMIN_UI_BASE);
    await expect(page.getByText(title)).toBeVisible({ timeout: 30_000 });
    await page.locator(`a[href="/interview?id=${created.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/interview/?\\?id=${created.id}`));

    const interviewerInput = page.getByPlaceholder('Self-directed');
    await expect(interviewerInput).toBeVisible({ timeout: 30_000 });
    await interviewerInput.fill(editedInterviewer);

    const saveButton = page.getByRole('button', { name: /save corrections/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.getByText(/saved/i).first()).toBeVisible({ timeout: 15_000 });

    // Confirm edit persisted via API
    const afterEdit = await getInterview(created.id);
    expect(afterEdit.metadata.interviewer).toBe(editedInterviewer);

    // Step 5 — Approve (native confirm dialog → accept)
    page.once('dialog', (d) => d.accept());
    const approveButton = page.getByRole('button', { name: /^approve$/i });
    await expect(approveButton).toBeVisible({ timeout: 15_000 });
    await expect(approveButton).toBeEnabled();
    await approveButton.click();
    await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 15_000 });

    // Trigger indexing rebuild
    await triggerBuild();
    console.log(`[pipeline] build triggered`);

    // Confirm the new interview ID is in the freshly built manifest
    const metadataRes = await fetch(`${SHOWCASE_BASE}/assets/build/metadata.json`);
    expect(metadataRes.ok).toBe(true);
    const metadata = (await metadataRes.json()) as { interviewIds: string[] };
    expect(metadata.interviewIds).toContain(created.id);

    // Step 6 — Validate the public interview archive links to the approved interview
    await gotoWithRetry(page, `${SHOWCASE_UI_BASE}/interviews`);
    await expect(page.getByRole('heading', { name: /^interviews$/i })).toBeVisible({
      timeout: 30_000,
    });
    const archiveLink = page.locator(`a[href="/interviews/view?id=${created.id}"]`);
    await expect(archiveLink).toContainText(new RegExp(marker), { timeout: 30_000 });
    await archiveLink.click();

    // Title is rendered as Chakra Text (not a heading) — match by text
    await expect(page.getByText(new RegExp(marker)).first()).toBeVisible({ timeout: 30_000 });
    // Prove LLM-generated content rendered — these are real section headings on the detail page
    await expect(page.getByRole('heading', { name: /key summaries|notable quotes/i }).first())
      .toBeVisible({ timeout: 15_000 });
  } finally {
    // Step 7 — Best-effort cleanup
    if (interviewId) {
      try {
        await deleteInterview(interviewId);
        console.log(`[pipeline] cleaned up ${interviewId}`);
      } catch (e) {
        console.warn(`[pipeline] cleanup failed for ${interviewId}: ${(e as Error).message}`);
      }
    }
  }
});
