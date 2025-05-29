# Decentralized Dating App

A privacy-first, decentralized dating application built on peer-to-peer technologies.

## Architecture

This project implements a comprehensive decentralized dating app architecture with:

### Core SDK Modules

- **Identity**: Key management, DIDs, recovery mechanisms, and identity verification
- **Network**: P2P networking with libp2p, WebRTC, discovery, mesh coordination, and signaling
- **Storage**: CRDT-based local-first data storage with replication and IPFS integration
- **Matching**: Privacy-preserving matchmaking with compatibility scoring and recommendations
- **Crypto**: Encryption, signatures, and zero-knowledge proofs for security
- **Incentives**: Resource allocation and micropayments

### Protocol Definitions

- **Schemas**: JSON schemas for users, messages, matches, payments, and resources
- **Messages**: Protocol definitions for handshakes, sync, discovery, and resource management
- **API Interfaces**: Contract definitions for profiles, matchmaking, messaging, payments, and resources

## Features

- **Privacy-first**: User data stays on their device with selective sharing
- **Decentralized**: No central servers or databases
- **Local-first**: Works offline with seamless synchronization
- **End-to-end encrypted**: All communications are secured
- **Self-sovereign identity**: Users control their own identity and data
- **Cross-platform**: Works on web, mobile, and desktop

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/decentralized-dating-app.git
cd decentralized-dating-app

# Install dependencies
npm install

# Build the project
npm run build
```

### Development

```bash
# Run in development mode with hot reloading
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT

## Project Structure

```
/
├── core/                     # Core SDK (framework agnostic)
│   ├── identity/             # User identity management
│   ├── network/              # P2P networking components
│   ├── storage/              # CRDT-based data storage
│   ├── matching/             # Matching algorithms
│   ├── crypto/               # Cryptography utilities
│   └── index.ts              # SDK entry point
│
├── protocol/                 # Protocol definitions (shared)
│   ├── schema/               # Data schema definitions
│   ├── messages/             # Message type definitions
│   └── api/                  # API interfaces
│
├── platforms/                # Platform-specific implementations
│   ├── web/                  # Web application
│   │   ├── components/       # Framework-agnostic components
│   │   └── adapters/         # Framework-specific adapters
│   ├── mobile/               # Mobile applications
│   └── desktop/              # Desktop applications
│
├── services/                 # High-level service modules
│   ├── matching/             # Matching service implementation
│   ├── messaging/            # Messaging service implementation
│   ├── profile/              # Profile management service
│   └── games/                # Games and interactive elements
│
├── native/                   # Native implementations and bindings
│   ├── rust/                 # Rust code (compiled to WASM)
│   └── go/                   # Go code (compiled to WASM)
│
└── tooling/                  # Development and build tools
```

## Core Components

### Identity System

The identity module manages user authentication, key generation, and secure profile handling.

```typescript
import { KeyManager } from 'decentralized-dating-app/core';

const keyManager = new KeyManager();
const identity = await keyManager.generateNewIdentity();
```

### P2P Network

The networking module establishes direct connections between users.

```typescript
import { PeerConnection } from 'decentralized-dating-app/core';

const connection = new PeerConnection(myUserId, theirUserId, true);
connection.on('connected', () => {
  connection.sendMessage('Hello!');
});
```

### Data Synchronization

The storage system ensures data consistency across devices.

```typescript
import { CRDTDocument } from 'decentralized-dating-app/core';

const profileDoc = new CRDTDocument(initialProfile, 'user-profile');
profileDoc.update(draft => {
  draft.bio = 'Hello world!';
});
```

## Security & Privacy

- End-to-end encryption for all user data
- Zero-knowledge proofs for verifiable matching without data exposure
- Local-first storage with minimal data leaving the user's device
- Granular permissions system for data sharing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.