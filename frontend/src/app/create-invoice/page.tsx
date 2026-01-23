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
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Create Invoice</h1>

            {isConfirmed ? (
                <div className="max-w-md bg-gray-800 p-6 rounded-lg border border-green-500 text-center">
                    <div className="text-green-400 text-xl font-bold mb-4">Invoice Created Successfully!</div>
                    <p className="text-gray-300 mb-6">Your invoice has been minted on the blockchain.</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Create Another Invoice
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div>
                        <label className="block mb-2">Amount (USDC)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            placeholder="100.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            placeholder="Web Design Services"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Proof of Work Link (Optional)</label>
                        <input
                            type="url"
                            value={powLink}
                            onChange={(e) => setPowLink(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            placeholder="https://github.com/..."
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Payer Address</label>
                        <input
                            type="text"
                            value={payer}
                            onChange={(e) => setPayer(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            placeholder="0x..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || isConfirming}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {isPending ? 'Confirming...' : isConfirming ? 'Waiting for confirmation...' : 'Create Invoice'}
                    </button>
                    {hash && <div className="mt-4 text-sm text-gray-400 break-all">Transaction Hash: {hash}</div>}
                </form>
            )}
        </div>
    );
}
