# Chronos Agent

A full-stack reference implementation demonstrating pay-gated premium content using the x402 payment protocol on Cronos. The project consists of a Node/Express backend that validates and settles x402 payments via a Facilitator service, and a Next.js frontend that guides users through unlocking premium content with a connected wallet.

## Highlights
- **x402 paywall flow**: Return HTTP 402 with requirements, accept a Base64 `X-PAYMENT` header, verify off-chain, then settle on-chain.
- **Cronos network support**: Works with Cronos Mainnet or Testnet.
- **Modern frontend**: Next.js App Router with Wagmi + RainbowKit and Tailwind v4.
- **Extensible backend**: Express API with axios and environment-based configuration. Supabase client wired but optional.

## Architecture
```
root/
├─ backend/                      # Express server (Node)
│  ├─ server.js                  # x402 endpoints and facilitator integration
│  ├─ agent.js                   # (present placeholder)
│  ├─ indexer.js                 # (present placeholder)
│  └─ package.json               # scripts and dependencies
├─ frontend/                     # Next.js (App Router)
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ premium/page.tsx     # UI to unlock and view premium content
│  │  │  ├─ create-invoice/      # additional pages (present)
│  │  │  └─ ...
│  │  ├─ lib/x402.ts             # client helpers for x402 flow
│  │  ├─ components/             # Navbar etc.
│  │  └─ config/                 # contract config
│  ├─ public/
│  ├─ package.json
│  └─ .env                       # frontend envs (local)
└─ contracts/                    # contract artifacts/config (present)
```
## Tech Stack
- **Backend**: Node.js, Express, axios, dotenv, CORS
- **Blockchain**: `@crypto.com/facilitator-client`, `ethers`
- **Frontend**: Next.js 16, React 19, Tailwind v4, Wagmi, RainbowKit, React Query
- **Optional**: Supabase client initialized via env (currently unused in code path)

## Prerequisites
- Node.js (LTS recommended) and npm
- A wallet (e.g., MetaMask) for Cronos networks
- Access to a Facilitator service compatible with x402

## Environment Variables

### Backend (`backend/server.js`)
Required to run the x402 endpoints:
- `FACILITATOR_BASE_URL` – Base URL of the Facilitator service (e.g., https://facilitator.example.com)
- `X402_NETWORK` – `cronos` or `cronos-testnet`
- `X402_PAY_TO` – Recipient address
- `X402_ASSET` – Asset address or identifier for payment
- `X402_MAX_AMOUNT` – Max amount in smallest unit (string)
- `X402_MAX_TIMEOUT` – Max validity window in seconds (e.g., 300)

Optional (prepared but not currently used in active path):
- `SUPABASE_URL`
- `SUPABASE_KEY`

Defaults are provided in code for local exploration but you should set real values for production.

### Frontend (`frontend/src/lib/x402.ts`)
- `NEXT_PUBLIC_BACKEND_URL` – Base URL of the backend (default: `http://localhost:3001`). Must be prefixed with `NEXT_PUBLIC_` to be exposed to the browser.

Create `frontend/.env` with for example:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```
## Installation & Setup

### 1) Install dependencies
```
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```
### 2) Configure environment
- Backend: set the variables listed above (e.g., via a `.env` next to `backend/server.js`)
- Frontend: set `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env`

### 3) Run locally
```
# Terminal A – backend
cd backend
npm run dev   # starts Express on :3001

# Terminal B – frontend
cd frontend
npm run dev   # starts Next.js on :3000
```
Open http://localhost:3000 and navigate to `/premium`.

## Scripts

### Backend (`backend/package.json`)
- `npm run dev` – Start the Express server (port 3001 by default)
- `npm start` – Same as dev

### Frontend (`frontend/package.json`)
- `npm run dev` – Next dev server
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – ESLint

## x402 Payment Flow
The backend implements an HTTP 402 “Payment Required” flow in `backend/server.js`:
- **GET `/api/premium-data`**
  - If no `X-PAYMENT` header, responds `402` with `paymentRequirements`:
    ```json
    {
      "error": "Payment Required",
      "x402Version": 1,
      "paymentRequirements": {
        "scheme": "exact",
        "network": "cronos-testnet",
        "payTo": "0x...",
        "asset": "0x...",
        "maxAmountRequired": "1000000",
        "maxTimeoutSeconds": 300
      }
    }
    ```
  - If `X-PAYMENT` header present, the server:
    1) Verifies it off-chain via `POST {FACILITATOR_BASE_URL}/verify`
    2) Settles on-chain via `POST {FACILITATOR_BASE_URL}/settle`
    3) Returns premium content and settlement details

- **GET `/api/x402/requirements`** – Convenience endpoint to fetch current requirements.

### Frontend integration
Located in `frontend/src/lib/x402.ts` and `frontend/src/app/premium/page.tsx`:
- `fetchWithX402()` calls the backend. If it receives 402, the UI displays requirements and lets the user provide a Base64 `X-PAYMENT` header.
- `generatePaymentHeader(requirements)` uses `@crypto.com/facilitator-client` and an `ethers` signer to produce a valid header from the connected wallet.
- The premium page provides helpers to switch to the correct Cronos network via Wagmi.

## API Reference (Backend)
- `GET /api/premium-data`
  - Headers: optional `X-PAYMENT: <Base64>`
  - 200: `{ content, settlement? }`
  - 402: `{ error: 'Payment Required', x402Version, paymentRequirements }`
- `GET /api/x402/requirements`
  - 200: `{ x402Version, paymentRequirements }`

## Troubleshooting
- **402 keeps returning**: Ensure the `X-PAYMENT` header is Base64 from the current requirements and not expired. Check `X402_MAX_TIMEOUT`.
- **Wrong network**: Use the Switch Network button on `/premium` or configure the wallet for Cronos Testnet/Mainnet.
- **CORS issues**: The backend enables CORS by default; verify `NEXT_PUBLIC_BACKEND_URL` resolves correctly from the browser.
- **Facilitator errors**: Inspect backend logs and the HTTP response returned in `detail` when verification/settlement fails.
- **Env not loaded**: Confirm `.env` placement and that `dotenv.config()` runs before reading variables (it does in `server.js`).

## Security Notes
- Do not trust client-provided values beyond the `X-PAYMENT` header; the backend independently verifies and settles via the Facilitator.
- Store all secrets in environment variables. Never commit keys to version control.

## Roadmap
- Integrate Supabase for storing entitlements and receipts
- Add automated tests and CI
- Expand premium content examples and UX

## License
This project is provided as-is under the ISC license (see `backend/package.json`). Adjust as needed for your organization.

## Acknowledgements
- Cronos ecosystem and the Facilitator client libraries
- Wagmi, RainbowKit, Next.js community
