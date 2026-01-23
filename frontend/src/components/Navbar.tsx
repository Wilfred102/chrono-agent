'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
    return (
        <nav className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-white">
                    Chronos Freelancer
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/create-invoice" className="text-gray-300 hover:text-white">
                        Create
                    </Link>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white">
                        Dashboard
                    </Link>
                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}
