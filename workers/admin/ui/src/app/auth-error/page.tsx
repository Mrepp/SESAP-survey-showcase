import { Suspense } from 'react';
import { AuthError } from '../../views/AuthError';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthError />
    </Suspense>
  );
}
