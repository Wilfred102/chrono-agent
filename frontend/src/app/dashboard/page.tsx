'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useReadContracts } from 'wagmi';
import { parseAbiItem, formatUnits, zeroAddress } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import Link from 'next/link';

type Invoice = {
    id: bigint;
    amount: bigint;
    description: string; // We'll show metadata hash for now
    status: 'Paid' | 'Pending' | 'Cancelled';
    token: string;
};

export default function Dashboard() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [invoiceIds, setInvoiceIds] = useState<bigint[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // 1. Fetch InvoiceCreated logs for the current user
    useEffect(() => {
        async function fetchLogs() {
            if (!address || !publicClient) return;
            setIsLoadingLogs(true);
            try {
                const currentBlock = await publicClient.getBlockNumber();
                const CHUNK_SIZE = 2000n;
                const MAX_BLOCKS = 20000n; // Look back ~30 hours
                const fromBlock = currentBlock - MAX_BLOCKS > 0n ? currentBlock - MAX_BLOCKS : 0n;

                let allLogs: any[] = [];

                // Fetch in chunks
                for (let i = currentBlock; i > fromBlock; i -= CHUNK_SIZE) {
                    const to = i;
                    const from = i - CHUNK_SIZE > fromBlock ? i - CHUNK_SIZE : fromBlock;

                    try {
                        const logs = await publicClient.getLogs({
                            address: CONTRACTS.InvoiceRegistry.address,
                            event: parseAbiItem('event InvoiceCreated(uint256 indexed id, address indexed issuer, address indexed payer, uint256 amount, address token, uint256 dueDate)'),
                            args: {
                                issuer: address
                            },
                            fromBlock: from,
                            toBlock: to
                        });
                        allLogs = [...allLogs, ...logs];
                    } catch (err) {
                        console.warn(`Failed to fetch logs for range ${from}-${to}`, err);
                    }
                }

                // Extract IDs and reverse to show newest first
                // Use Set to avoid duplicates if chunks overlap or logic is fuzzy
                const uniqueIds = Array.from(new Set(allLogs.map(log => log.args.id!))).reverse();
                setInvoiceIds(uniqueIds);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setIsLoadingLogs(false);
            }
        }

        fetchLogs();
    }, [address, publicClient]);

    // 2. Fetch details for each invoice ID
    const { data: invoicesData, isLoading: isLoadingDetails } = useReadContracts({
        contracts: invoiceIds.map(id => ({
            address: CONTRACTS.InvoiceRegistry.address,
            abi: CONTRACTS.InvoiceRegistry.abi,
            functionName: 'getInvoice',
            args: [id],
        })),
        query: {
            enabled: invoiceIds.length > 0,
        }
    });

    // 3. Process data for display
    const invoices: Invoice[] = (invoicesData as any[])?.map(result => {
        if (result.status === 'failure' || !result.result) return null;
        const inv = result.result;
        return {
            id: inv.id,
            amount: inv.amount,
            description: inv.metadataHash, // Showing full description now
            status: inv.isPaid ? 'Paid' : inv.isCancelled ? 'Cancelled' : 'Pending',
            token: inv.token,
        };
    }).filter((inv): inv is Invoice => inv !== null) || [];

    if (!address) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
                <p>Please connect your wallet to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Link href="/create-invoice" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create New Invoice
                </Link>
            </div>

            {isLoadingLogs || (invoiceIds.length > 0 && isLoadingDetails) ? (
                <div className="text-gray-400">Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="text-gray-400">No invoices found. Create your first one!</div>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((inv) => (
                        <div key={inv.id.toString()} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">
                                    {inv.description.split('| PoW:')[0]}
                                    {inv.description.includes('| PoW:') && (
                                        <a
                                            href={inv.description.split('| PoW:')[1].trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded hover:bg-blue-800"
                                        >
                                            View Work ↗
                                        </a>
                                    )}
                                </h3>
                                <p className="text-gray-400">
                                    {formatUnits(inv.amount, 6)} {inv.token === zeroAddress ? 'CRO' : 'USDC'}
                                </p>
                                <div className="text-xs text-gray-500 mt-1">ID: {inv.id.toString()}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/pay-invoice/${inv.id}`;
                                        navigator.clipboard.writeText(url);
                                        alert('Payment link copied to clipboard!');
                                    }}
                                    className="text-gray-400 hover:text-white text-sm"
                                    title="Copy Payment Link"
                                >
                                    🔗
                                </button>
                                <span className={`px-3 py-1 rounded text-sm ${inv.status === 'Paid' ? 'bg-green-900 text-green-300' :
                                        inv.status === 'Cancelled' ? 'bg-red-900 text-red-300' :
                                            'bg-yellow-900 text-yellow-300'
                                    }`}>
                                    {inv.status}
                                </span>
                                <Link href={`/pay-invoice/${inv.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                                    View/Pay
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
