'use client';

import { Metadata } from 'next';

const metadata: Metadata = {
  title: 'Coming Soon - QuietShelter Empowerment Foundation',
  description: 'Stay tuned for updates from QuietShelter Empowerment Foundation.',
  openGraph: {
    title: 'Coming Soon - QuietShelter Empowerment Foundation',
    description: 'Stay tuned for updates from QuietShelter Empowerment Foundation.',
    url: 'https://your-domain.com/coming-soon',
  },
};

export default function ComingSoonPage() {
  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">Coming Soon</h1>
      </div>
    </main>
  );
}