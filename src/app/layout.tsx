import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusGraph — Software Supply Chain & Vulnerability Intelligence',
  description: 'Graph-database-backed software supply chain security platform powered by CognoDB Cloud and openCypher.',
  keywords: ['Graph Database', 'CognoDB', 'Neo4j', 'Cypher', 'Vulnerability Intelligence', 'Supply Chain Security', 'Log4j', 'CVE'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
