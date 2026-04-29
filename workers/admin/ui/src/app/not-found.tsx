import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Not found</h1>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>That page does not exist.</p>
      <Link href="/" style={{ color: '#0d9488', textDecoration: 'underline' }}>
        Back to dashboard
      </Link>
    </div>
  );
}
