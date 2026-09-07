import { Suspense } from 'react';
import { SubmitterReview } from '../../views/SubmitterReview';

/**
 * Served for every `/review/<token>` path: the worker rewrites those to this
 * one static page, and the token is read from the URL client-side. A static
 * export cannot enumerate tokens ahead of time, and they must not appear in a
 * build artifact anyway.
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SubmitterReview />
    </Suspense>
  );
}
