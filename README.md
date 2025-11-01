# Encrypted One-Time Code Verification

A fully homomorphic encryption (FHE) based system for verifying one-time codes without exposing the code values. Built with FHEVM, Hardhat, and Next.js.

## Features

- **Privacy-Preserving Verification**: Verify codes without exposing either the user's input or the expected code
- **FHEVM Integration**: Uses Zama's FHEVM for encrypted computations on-chain
- **Rainbow Wallet Support**: Connect using Rainbow wallet with a modern UI
- **Full Encryption Pipeline**: Complete workflow from code encryption to result decryption
- **Security First**: Implements robust encryption protocols ensuring data confidentiality
- **Production Ready**: Deployed on Sepolia testnet with comprehensive testing

## Project Structure

```
pro13/
├── contracts/              # Smart contracts
�?  └── EncryptedOneTimeCode.sol
├── deploy/                 # Deployment scripts
├── test/                   # Test files
├── frontend/               # Next.js frontend
�?  ├── app/               # Next.js app directory
�?  ├── components/        # React components
�?  ├── hooks/             # Custom React hooks
�?  └── fhevm/             # FHEVM integration
└── tasks/                  # Hardhat tasks
```

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- A WalletConnect Project ID (for Rainbow wallet)

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up Environment Variables

```bash
# Set up Hardhat variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # Optional

# Set up frontend environment
cd frontend
# Create .env.local file with:
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. Deploy Contracts

```bash
# Deploy to local network
npx hardhat node  # In one terminal
npx hardhat deploy --network localhost  # In another terminal

# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia
```

### 4. Generate ABI Files

```bash
cd frontend
npm run genabi
```

## Usage

### Running Tests

```bash
# Run local tests
npm run test

# Run Sepolia tests
npm run test:sepolia
```

### Running Frontend

```bash
cd frontend

# Development mode (with mock)
npm run dev:mock

# Development mode
npm run dev
```

### Hardhat Tasks

```bash
# Set expected code
npx hardhat --network localhost task:set-expected-code --code 1234

# Verify code
npx hardhat --network localhost task:verify-code --code 1234

# Get contract address
npx hardhat --network localhost task:address
```

## How It Works

1. **Set Expected Code**: The contract owner sets an encrypted expected code (can only be set once)
2. **User Verification**: User encrypts their code locally and submits it to the contract
3. **Encrypted Comparison**: Contract compares encrypted codes using FHE equality operation
4. **Encrypted Result**: Contract returns an encrypted boolean result
5. **User Decryption**: User decrypts the result to see if codes matched

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27 with FHEVM
- **Development**: Hardhat
- **Frontend**: Next.js 15, React 19
- **Wallet**: Rainbow Kit with Wagmi
- **Encryption**: Zama FHEVM SDK

## License

BSD-3-Clause-Clear

## Support

For issues and questions:
- Check [FHEVM Documentation](https://docs.zama.ai/fhevm)
- Visit [Zama Discord](https://discord.gg/zama)


// Auto-generated commit 1 by wswsyy at 11/01/2025 14:00:00
// Auto-generated commit 1 by wawsyy at 11/01/2025 19:00:00
// Auto-generated commit 1 by wswsyy at 11/02/2025 00:00:00
// Auto-generated commit 3 by wswsyy at 11/01/2025 12:00:00