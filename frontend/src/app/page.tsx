import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
        Chronos Freelancer
      </h1>
      <p className="text-xl text-gray-400 mb-8">
        Decentralized Invoicing & Settlement on Cronos
      </p>
      <div className="flex gap-4">
        <Link href="/create-invoice" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
          Create Invoice
        </Link>
        <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition border border-gray-700">
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
