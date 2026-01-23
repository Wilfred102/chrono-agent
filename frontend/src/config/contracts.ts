export const CONTRACTS = {
    InvoiceRegistry: {
        address: "0x9758D59d7B3edb38AaDBdE0BaAd5E136D1ce42AD",
        abi: [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    }
                ],
                "name": "InvoiceCancelled",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "payer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "dueDate",
                        "type": "uint256"
                    }
                ],
                "name": "InvoiceCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "payer",
                        "type": "address"
                    }
                ],
                "name": "InvoicePaid",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_invoiceId",
                        "type": "uint256"
                    }
                ],
                "name": "cancelInvoice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_payer",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_dueDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_metadataHash",
                        "type": "string"
                    }
                ],
                "name": "createInvoice",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_invoiceId",
                        "type": "uint256"
                    }
                ],
                "name": "getInvoice",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "issuer",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "payer",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "token",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "dueDate",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "metadataHash",
                                "type": "string"
                            },
                            {
                                "internalType": "bool",
                                "name": "isPaid",
                                "type": "bool"
                            },
                            {
                                "internalType": "bool",
                                "name": "isCancelled",
                                "type": "bool"
                            }
                        ],
                        "internalType": "struct InvoiceRegistry.Invoice",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "invoices",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "payer",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dueDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "metadataHash",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "isPaid",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "isCancelled",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_invoiceId",
                        "type": "uint256"
                    }
                ],
                "name": "markAsPaid",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },
    PaymentEscrow: {
        address: "0x5aEdAaECA91934ae02225589FE810606e6ecb80b",
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_invoiceRegistry",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "invoiceId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "PaymentDeposited",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "invoiceId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "PaymentReleased",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "invoiceRegistry",
                "outputs": [
                    {
                        "internalType": "contract InvoiceRegistry",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_invoiceId",
                        "type": "uint256"
                    }
                ],
                "name": "payInvoice",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    },
    RevenueSplitter: {
        address: "0x6b578B8b856d8cc45332810715fAA7c8A2D1059f",
        abi: [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "address[]",
                        "name": "recipients",
                        "type": "address[]"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256[]",
                        "name": "amounts",
                        "type": "uint256[]"
                    }
                ],
                "name": "RevenueSplit",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_token",
                        "type": "address"
                    },
                    {
                        "internalType": "address[]",
                        "name": "_recipients",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_amounts",
                        "type": "uint256[]"
                    }
                ],
                "name": "splitPayment",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    }
} as const;
