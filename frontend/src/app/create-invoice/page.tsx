'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '@/config/contracts';

export default function CreateInvoice() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [powLink, setPowLink] = useState('');
    const [payer, setPayer] = useState('');

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
        hash,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Creating invoice:', { amount, description, powLink, payer });

        // TODO: Get actual token address and handle metadata upload
        const mockTokenAddress = "0x0000000000000000000000000000000000000000";
        const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

        // Combine description and PoW link
        let fullDescription = description;
        if (powLink) {
            fullDescription += ` | PoW: ${powLink}`;
        }

        // TEMPORARY: Use description as metadataHash for visibility until IPFS is integrated
        const metadataHash = fullDescription || "No description";

        writeContract({
            address: CONTRACTS.InvoiceRegistry.address,
            abi: CONTRACTS.InvoiceRegistry.abi,
            functionName: 'createInvoice',
            args: [
                payer as `0x${string}`,
                parseUnits(amount, 6), // Assuming 6 decimals for USDC
                mockTokenAddress,
                BigInt(dueDate),
                metadataHash
            ],
        });
    };

    // Extract Invoice ID from logs if confirmed
    // Note: This is a bit complex without decoding logs properly, 
    // but usually the first event log topic contains the ID.
    // For MVP, we might need to ask user to check dashboard or use a better way to get ID.
    // However, we can try to find the InvoiceCreated event.

    // For now, let's just show a generic success message and link to dashboard
    // or try to parse the receipt if available.

    return (
        <main className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
            {/* Animated background visuals */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl animate-blob" />
                <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]" />
            </div>

            {/* Hero */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 md:pt-20 text-center">
                <h1 className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl animate-gradient-x">
                    Create an Invoice
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-white/70">
                    Send professional on-chain invoices and get paid in CRO or USDC.
                </p>
            </section>

            {/* Card container */}
            <section className="relative z-10 mx-auto max-w-2xl px-6 pb-16">
                <div className="relative mx-auto mt-8">
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-white/5 blur-2xl" />
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
                        {isConfirmed ? (
                            <div className="max-w-md mx-auto text-center">
                                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                                    <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" fill="currentColor" opacity="0.15" />
                                    </svg>
                                </div>
                                <div className="text-green-400 text-xl font-bold mb-2">Invoice Created Successfully!</div>
                                <p className="text-gray-300 mb-6">Your invoice has been minted on the blockchain.</p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5"
                                    >
                                        Go to Dashboard to View & Share
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAmount('');
                                            setDescription('');
                                            setPowLink('');
                                            setPayer('');
                                            window.location.reload();
                                        }}
                                        className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-xl backdrop-blur transition"
                                    >
                                        Create Another Invoice
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
                                <div>
                                    <label className="block mb-2 text-sm text-white/80">Amount (USDC)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-900/60 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:bg-gray-900/80 transition"
                                        placeholder="100.00"
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm text-white/80">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-900/60 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:bg-gray-900/80 transition"
                                        placeholder="Web Design Services"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm text-white/80">Proof of Work Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={powLink}
                                        onChange={(e) => setPowLink(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-900/60 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:bg-gray-900/80 transition"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm text-white/80">Payer Address</label>
                                    <input
                                        type="text"
                                        value={payer}
                                        onChange={(e) => setPayer(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-900/60 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40 focus:bg-gray-900/80 transition font-mono text-sm"
                                        placeholder="0x..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPending || isConfirming}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {isPending ? 'Confirming in wallet…' : isConfirming ? 'Waiting for confirmation…' : 'Create Invoice'}
                                </button>
                                {hash && <div className="mt-2 text-xs text-white/50 break-all">Transaction Hash: {hash}</div>}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
