# AI Avatar System (Phase 1)

AI-powered 3D avatar system with natural dialogue, lip-sync, and emotional expressions.

## Project Overview

This is an AI Avatar application that displays a 3D VRM avatar responding to AI conversations with:
- 3D VRM avatar display and animation
- AI chat functionality (OpenAI GPT-4)
- Lip-sync with speech
- Emotion expressions
- Idle motion animations

## Project Structure

```
ai-avater/
├── frontend/          # React + Vite frontend application
├── backend/           # Python Lambda functions (to be implemented)
├── infrastructure/    # Terraform infrastructure code
└── document/          # Japanese specification documents
```

## Quick Start

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The development server will start at [http://localhost:5173](http://localhost:5173)

### Available Commands (Frontend)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Technology Stack

### Frontend
- **Framework**: React 19.x with TypeScript 5.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **3D Rendering**: Three.js + @pixiv/three-vrm
- **Animation**: GSAP (planned)

### Backend (To be implemented)
- **Runtime**: AWS Lambda with Python 3.12+
- **AI**: OpenAI GPT-4
- **TTS**: Google Cloud Text-to-Speech
- **Lip-sync**: Rhubarb Lip Sync

### Infrastructure
- **Cloud**: AWS
- **IaC**: Terraform
- **Frontend Hosting**: S3 + CloudFront
- **Backend**: Lambda + API Gateway (planned)

## Documentation

Comprehensive documentation is available in the [document/](document/) directory (Japanese):
- [00-INDEX.md](document/00-INDEX.md) - Documentation index
- [01-プロジェクト概要.md](document/01-プロジェクト概要.md) - Project overview
- [02-システム構成.md](document/02-システム構成.md) - System architecture
- And more...

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## Development Status

**Current Phase**: Phase 1 - Initial Setup
- ✅ Frontend structure setup
- ✅ VRM avatar display components
- ✅ Basic animation controls
- ⏳ Backend Lambda functions (planned)
- ⏳ AI chat integration (planned)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## Browser Compatibility

- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

Requires: WebGL 2.0, ES2020+, Web Audio API

## License

Private project
