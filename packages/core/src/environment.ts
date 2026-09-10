import { SesapError } from './errors';

/**
 * The three environments a worker can run in. `ENVIRONMENT` is a plain string
 * var in every wrangler config; funnelling it through here is what keeps a
 * typo from silently reading as "not production" and switching on a dev-only
 * escape hatch (the `next dev` asset proxy, the admin auth bypass, the AI
 * fixture provider) somewhere it must never be on.
 */
export type DeployEnv = 'development' | 'staging' | 'production';

export const DEPLOY_ENVS = ['development', 'staging', 'production'] as const;

/** Anything carrying an `ENVIRONMENT` var — every worker `Env` qualifies. */
export interface DeployEnvHolder {
  ENVIRONMENT: string;
}

export type DeployEnvSource = string | DeployEnvHolder;

export class UnknownDeployEnvError extends SesapError {
  constructor(value: unknown) {
    super(
      `Unknown ENVIRONMENT ${JSON.stringify(value)} — expected one of ${DEPLOY_ENVS.join(', ')}`,
      'INVALID_ENVIRONMENT',
      500,
      { value, allowed: DEPLOY_ENVS },
    );
    this.name = 'UnknownDeployEnvError';
  }
}

function rawValue(source: DeployEnvSource): string {
  return typeof source === 'string' ? source : source?.ENVIRONMENT;
}

/**
 * Parse without throwing. Returns `null` for anything outside the three known
 * environments — including the `'test'` that unit suites bind — so callers that
 * only need a yes/no answer stay total.
 */
export function parseDeployEnv(source: DeployEnvSource): DeployEnv | null {
  const value = rawValue(source);
  return (DEPLOY_ENVS as readonly string[]).includes(value) ? (value as DeployEnv) : null;
}

/** Parse, rejecting anything unrecognized. */
export function readDeployEnv(source: DeployEnvSource): DeployEnv {
  const parsed = parseDeployEnv(source);
  if (!parsed) throw new UnknownDeployEnvError(rawValue(source));
  return parsed;
}

export function isDevelopment(source: DeployEnvSource): boolean {
  return parseDeployEnv(source) === 'development';
}

export function isStaging(source: DeployEnvSource): boolean {
  return parseDeployEnv(source) === 'staging';
}

export function isProduction(source: DeployEnvSource): boolean {
  return parseDeployEnv(source) === 'production';
}
