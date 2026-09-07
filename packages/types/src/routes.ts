/**
 * Public showcase routes that other workers link to. Intake builds these into
 * emails and records; the showcase serves them. One definition so a route
 * rename cannot orphan a link.
 */
export const SHOWCASE_ROUTES = {
  /** Streams self-service media out of R2. Also the Hono pattern when `id` is `:id`. */
  media: (id: string) => `/media/${id}`,
  /** The published interview page. `trailingSlash` is on in the export, hence the `/?`. */
  interviewView: (id: string) => `/interviews/view/?id=${encodeURIComponent(id)}`,
  /** A build artifact by its R2 key, e.g. `build/<buildId>/interviews.json`. */
  buildAsset: (key: string) => `/assets/${key}`,
} as const;
