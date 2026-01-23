---

# Freelance Invoicing Module (Actual Working)

This module lets a freelancer create on-chain invoices, share a payment link, and receive payment in native CRO or ERC-20 (e.g., USDC). It is implemented in the frontend and backed by deployed contracts configured in `frontend/src/config/contracts.ts`.

## Contracts
- **InvoiceRegistry** (`CONTRACTS.InvoiceRegistry.address`: `0x9758D59d7B3edb38AaDBdE0BaAd5E136D1ce42AD`)
  - `createInvoice(payer, amount, token, dueDate, metadataHash)`
  - `getInvoice(id)` → returns `{ id, issuer, payer, amount, token, dueDate, metadataHash, isPaid, isCancelled }`
  - Events: `InvoiceCreated`, `InvoicePaid`, `InvoiceCancelled`
- **PaymentEscrow** (`CONTRACTS.PaymentEscrow.address`: `0x5aEdAaECA91934ae02225589FE810606e6ecb80b`)
  - `payInvoice(id)`; payable when token is native, otherwise transfers approved ERC-20
  - Events: `PaymentDeposited`, `PaymentReleased`
- **RevenueSplitter** (`0x6b578B8b856d8cc45332810715fAA7c8A2D1059f`) – available for splits; not wired into the current UI

## Routes & Screens
- **`/create-invoice`** (`frontend/src/app/create-invoice/page.tsx`)
  - Inputs: `amount`, `description`, optional `Proof of Work (PoW) link`, `payer`
  - Calls `InvoiceRegistry.createInvoice(...)`
  - Temporary metadata: `metadataHash = "<desc> | PoW: <url>"` (replace with IPFS/CID in production)
- **`/dashboard`** (`frontend/src/app/dashboard/page.tsx`)
  - Fetches `InvoiceCreated` logs for the connected `issuer`, then `getInvoice(id)` for details
  - Shows description, PoW link, amount, token, status; copy payment link button: `https://<host>/pay-invoice/<id>`
- **`/pay-invoice/[id]`** (`frontend/src/app/pay-invoice/[id]/page.tsx`)
  - Loads invoice via `getInvoice(id)`
  - If token is native (`zeroAddress`) → one-click "Pay Invoice" sends `value = amount` to `PaymentEscrow.payInvoice(id)`
  - If token is ERC-20 → checks `allowance(user, PaymentEscrow)`
    - If `allowance < amount` → show "Approve Token" (calls `erc20.approve(PaymentEscrow, amount)`) then "Pay Invoice"

## Status Lifecycle
- `Pending` → initial state after creation
- `Paid` → after `PaymentEscrow.payInvoice(id)` confirms
- `Cancelled` → via `InvoiceRegistry.cancelInvoice(id)` (UI action not exposed yet)

## Amounts, Tokens, Decimals
- Current UI assumes USDC with 6 decimals on create: `parseUnits(amount, 6)`
- To switch tokens:
  - Use the correct token `address` at create time
  - Adjust `parseUnits/formatUnits` to the token’s decimals
- Native CRO is represented by `zeroAddress` and requires transaction `value`

## Sharing & Discoverability
- Shareable link: `/pay-invoice/<id>` from the Dashboard
- Dashboard log fetching uses chunked ranges and a look-back window to avoid RPC timeouts; consider indexing for large histories

## Production Notes
- Replace placeholder token address with the actual ERC-20 (if using tokens) and correct decimals
- Persist invoice metadata to IPFS and store its CID in `metadataHash`
- Add issuer controls (cancel invoice, withdrawal flows if required by escrow)
- Add pagination/indexing for invoices rather than client-only log scans
