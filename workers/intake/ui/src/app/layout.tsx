import type { Metadata } from 'next';
import { Provider } from '../components/provider';

export const metadata: Metadata = {
  title: 'Share your SESAP interview',
  description: 'Record and share your Oregon State student experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
