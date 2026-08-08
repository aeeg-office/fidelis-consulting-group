// AEEG Practice Buddy - Main Page
// Integrated into the AEEG Website

import dynamic from 'next/dynamic';
import Head from 'next/head';

const PracticeBuddyApp = dynamic(() => import('../components/PracticeBuddyApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading Practice Buddy...</p>
      </div>
    </div>
  ),
});

export default function PracticeBuddyPage() {
  return (
    <>
      <Head>
        <title>AEEG SAT Practice Buddy</title>
        <meta name="description" content="American Egyptian Education Group - SAT Practice Platform" />
      </Head>
      <PracticeBuddyApp />
    </>
  );
}