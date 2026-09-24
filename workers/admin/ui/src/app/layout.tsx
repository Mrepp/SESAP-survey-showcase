import type { Metadata } from 'next';
import { Provider } from '../components/ui/provider';

export const metadata: Metadata = {
  title: 'SESAP Admin',
  description: 'SESAP Survey Showcase admin',
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
