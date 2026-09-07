import { Suspense } from 'react';
import { IntakeWizard } from '../views/IntakeWizard';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IntakeWizard />
    </Suspense>
  );
}
