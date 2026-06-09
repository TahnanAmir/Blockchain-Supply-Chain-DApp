# ⛓️ Blockchain Supply Chain DApp

> A decentralized supply chain management system that tracks products from manufacturer to customer with full on-chain transparency — built on **Polygon Amoy**.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.28-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Polygon](https://img.shields.io/badge/Network-Polygon%20Amoy-8247E5?logo=polygon&logoColor=white)](https://polygon.technology/)

---

## Overview

Traditional supply chains rely on siloed databases and paper trails that are difficult to audit. This project solves that by storing product registrations, ownership transfers, and role assignments directly on the blockchain.

Each product moves through a **strict, role-enforced pipeline**:

```
Manufacturer → Distributor → Retailer → Customer
```

Every handoff is recorded immutably, giving anyone with a product ID a complete **chain-of-custody audit trail**.

---

## Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | Four participant roles with on-chain permissions enforced by smart contract modifiers |
| **Product Registration** | Manufacturers create products with name, description, and auto-assigned on-chain ID |
| **Guided Transfers** | Transfers only succeed when sent to the correct next role in the supply chain |
| **Chain of Custody** | Full ownership history stored on-chain and visualized as an interactive timeline |
| **Live Dashboard** | Real-time stats — total products, status breakdown, and recent activity |
| **Product Inventory** | Searchable, filterable table of all registered products with ownership indicators |
| **MetaMask Integration** | Connect wallet, sign transactions, and view receipts on PolygonScan |
| **Modern UI** | Dark-themed React frontend with role-aware navigation and toast notifications |

---

### Product Status Lifecycle

| Status | Value | Triggered By |
|--------|-------|--------------|
| Manufactured | `0` | Product registration |
| In Transit | `1` | Manufacturer → Distributor transfer |
| At Retailer | `2` | Distributor → Retailer transfer |
| Delivered | `3` | Retailer → Customer transfer |

### Role Permissions

| Role | ID | Capabilities |
|------|----|--------------|
| **Manufacturer** | `1` | Register products, assign roles, transfer to Distributor |
| **Distributor** | `2` | Receive from Manufacturer, transfer to Retailer |
| **Retailer** | `3` | Receive from Distributor, transfer to Customer |
| **Customer** | `4` | Final recipient — no transfer rights |

> The contract deployer is automatically assigned the **Manufacturer** role in the constructor.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contract** | Solidity `^0.8.20` |
| **Development Framework** | Hardhat + Hardhat Toolbox |
| **Blockchain Network** | Polygon Amoy Testnet |
| **RPC Provider** | Alchemy |
| **Frontend** | React 19 + Vite 8 |
| **Web3 Library** | ethers.js v6 |
| **Wallet** | MetaMask |

---

## Project Structure

```
├── contracts/
│   └── MuhammadTahnanAamir_SupplyChain.sol   # Core supply chain smart contract
├── scripts/
│   └── deploy.js                              # Hardhat deployment script
├── frontend/
│   ├── src/
│   │   ├── abi/                               # Compiled contract ABI
│   │   ├── components/                        # Navbar, Footer, ConnectWallet
│   │   ├── pages/                             # Dashboard, Register, Transfer, etc.
│   │   ├── styles/                            # Global CSS (dark theme)
│   │   └── utils/                             # ethers.js helpers & config
│   └── package.json
├── hardhat.config.js                          # Hardhat + Polygon Amoy config
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MetaMask](https://metamask.io/) browser extension
- [Alchemy](https://www.alchemy.com/) API key (for deployment)
- Polygon Amoy testnet MATIC ([faucet](https://faucet.polygon.technology/))

### 1. Clone the Repository

```bash
git clone https://github.com/TahnanAmir/Blockchain-Supply-Chain-DApp.git
cd Blockchain-Supply-Chain-DApp
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

### 4. Compile & Deploy the Smart Contract

```bash
# Compile
npx hardhat compile

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy.js --network amoy
```

After deployment, update the contract address in `frontend/src/utils/config.js`:

```js
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

Also copy the compiled ABI to the frontend if you redeploy:

```bash
cp artifacts/contracts/MuhammadTahnanAamir_SupplyChain.sol/MuhammadTahnanAamir_SupplyChain.json \
   frontend/src/abi/MuhammadTahnanAamir_SupplyChain.json
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm install ethers
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

### 6. Connect MetaMask

1. Add the **Polygon Amoy** network to MetaMask
2. Ensure your wallet has testnet MATIC
3. Click **Connect MetaMask** on the landing page
4. Approve the connection request

---

## Usage Guide

### Step 1 — Assign Roles (Manufacturer only)

Navigate to **Assign Roles** and grant wallet addresses one of the four participant roles. Only the Manufacturer (contract deployer) can perform this action.

### Step 2 — Register a Product (Manufacturer only)

Go to **Register**, enter a product name and description, and submit the transaction. The product receives a unique on-chain ID and starts in `Manufactured` status.

### Step 3 — Transfer Through the Chain

Use **Transfer** to move products to the next participant:

- Manufacturer → Distributor
- Distributor → Retailer
- Retailer → Customer

The contract enforces ownership and role validation on every transfer.

### Step 4 — Audit Product History

Open **Audit Trail**, enter a product ID, and view the complete chain-of-custody timeline with resolved roles for each address in the history.

### Step 5 — Browse All Products

The **Products** page lists every registered product with search, status filters, and quick actions for transfer and history lookup.

---

## Smart Contract API

### Write Functions

| Function | Access | Description |
|----------|--------|-------------|
| `assignRole(address, Role)` | Manufacturer | Assign a role to a wallet address |
| `registerProduct(string name, string desc)` | Manufacturer | Register a new product |
| `transferProduct(uint id, address to)` | Current owner | Transfer product to the next role |

### Read Functions

| Function | Description |
|----------|-------------|
| `getProduct(uint id)` | Returns product details (id, name, description, owner, status) |
| `getProductHistory(uint id)` | Returns array of all previous owners |
| `getRole(address user)` | Returns the role enum for a given address |
| `productCounter()` | Returns total number of registered products |

---

## Development Scripts

### Root (Hardhat)

```bash
npx hardhat compile          # Compile smart contracts
npx hardhat run scripts/deploy.js --network amoy   # Deploy to Amoy
```

### Frontend

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Security Considerations

- Role checks and ownership validation are enforced on-chain via Solidity modifiers and `require` statements
- Transfers follow a strict state machine — invalid role transitions are rejected
- Private keys and API credentials must be stored in `.env` and never committed to version control
- This project is deployed on a **testnet** and is intended for educational and demonstration purposes

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
