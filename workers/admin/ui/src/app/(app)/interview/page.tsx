import { Suspense } from 'react';
import { Review } from '../../../views/Review';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Review />
    </Suspense>
  );
}
