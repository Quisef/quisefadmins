// This is now a Server Component – no 'use client' here
import { Suspense } from 'react';
import PitchDeckForm from './PitchDeckForm';
import { Loader2 } from 'lucide-react';

// Nice loading fallback while the client component hydrates / reads search params
function FormLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/30 flex items-center justify-center">
      <div className="text-center p-8">
        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Preparing your submission form...</h2>
        <p className="text-gray-600">Loading registration details and form...</p>
      </div>
    </div>
  );
}

export default function PitchDeckPage() {
  return (
    <Suspense fallback={<FormLoading />}>
      <PitchDeckForm />
    </Suspense>
  );
}