# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI Avatar System (Phase 1)** - a React application that displays a 3D animated avatar that responds to AI-powered conversations with lip-sync, emotions, and natural gestures.

**Core Concept**: AI-powered avatar that animates in response to conversation, providing a natural dialogue experience with:
- 3D VRM avatar display and animation
- AI chat functionality (OpenAI GPT-4)
- Lip-sync with speech
- Emotion expressions
- Idle motion animations

## Project Structure

This is a **monorepo** containing frontend, backend, and infrastructure code:

```
ai-avater/
├── frontend/          # React + Vite application
├── backend/           # FastAPI + Mangum Lambda function
├── infrastructure/    # AWS SAM infrastructure code
└── document/          # Japanese specification documents
```

## Commands

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview

# Type check
npx tsc -b

# Type check with watch mode
npx tsc -b --watch
```

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start local development server (FastAPI with hot reload)
python local_server.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)

# Run tests
pytest

# Test with SAM CLI (Lambda environment simulation)
cd ../infrastructure
sam local start-api
# → http://localhost:3000
```

### Infrastructure Management (AWS SAM)
```bash
cd infrastructure

# Build SAM application
sam build

# Deploy to AWS (guided setup for first time)
sam deploy --guided

# Deploy with saved configuration
sam deploy

# Test locally
sam local start-api

# Invoke specific function
sam local invoke BackendFunction --event events/chat.json
```

## Architecture

### System Architecture (Phase 1)

This is a **monorepo project** with separated frontend, backend, and infrastructure:

**Frontend** (`frontend/` directory):
- **Build Tool**: Vite 7.x (chosen for fast HMR, excellent Three.js compatibility)
- **Framework**: React 19.x with TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **3D Rendering**: Three.js + @pixiv/three-vrm for VRM avatar support
- **Animation**: GSAP for smooth animations (planned)
- **State Management**: Zustand (planned)
- **API Communication**: Axios (planned)

**Backend** (`backend/` directory):
- **Runtime**: AWS Lambda with Python 3.12+
- **Framework**: FastAPI + Mangum (ASGI adapter for Lambda)
- **AI**: AWS Bedrock (Nova Model) for dialogue generation
- **TTS**: Amazon Polly (Neural TTS) for speech synthesis
- **Lip-sync**: Rhubarb Lip Sync for phoneme extraction
- **Local Development**: Uvicorn with hot reload

**Infrastructure** (`infrastructure/` directory):
- **IaC**: AWS SAM (Serverless Application Model)
- **Frontend Hosting**: S3 + CloudFront
- **Backend**: API Gateway + Lambda (FastAPI + Mangum)
- **Storage**: S3 for audio files and assets
- **Deployment**: `sam build` → `sam deploy`

### Key Design Decisions

**Why Vite + React (not Next.js)?**
- No need for SSR/SSG (SPA architecture)
- Fast HMR is critical for animation development iteration
- Excellent Three.js ecosystem compatibility
- Clean separation between frontend and backend services

**Frontend Component Architecture**:
```
frontend/src/
├── components/
│   ├── Avatar/          # 3D avatar rendering and control
│   │   ├── AvatarCanvas.tsx         # ✅ Implemented
│   │   ├── VRMAvatar.tsx            # ✅ Implemented
│   │   ├── AnimationControls.tsx    # ✅ Implemented
│   │   ├── ExpressionControls.tsx   # ✅ Implemented
│   │   ├── AnimationManager.ts      # Animation priority system (planned)
│   │   ├── LipSyncController.ts     # Mouth movement sync (planned)
│   │   └── EmotionController.ts     # Facial expressions (planned)
│   ├── Chat/            # Chat UI components (planned)
│   └── UI/              # Shared UI components (planned)
├── hooks/               # Custom React hooks
│   ├── useVRMAnimation.ts           # ✅ Implemented
│   └── useVRMAnimationPlayer.ts     # ✅ Implemented
├── services/            # API and audio services (planned)
├── utils/              # Helper functions (planned)
└── types/              # TypeScript type definitions
    └── index.ts                     # ✅ Implemented

**Backend Architecture (FastAPI + Mangum)**:
```
backend/
├── app/
│   ├── main.py                      # FastAPI app + Mangum handler
│   ├── routers/
│   │   ├── chat.py                  # POST /api/chat endpoint
│   │   └── health.py                # GET /api/health endpoint
│   ├── services/
│   │   ├── ai_service.py            # OpenAI integration
│   │   ├── tts_service.py           # Google TTS integration
│   │   └── lipsync_service.py       # Rhubarb Lip Sync
│   └── models/
│       └── schemas.py               # Pydantic models
├── local_server.py                  # Local development server
├── requirements.txt
└── tests/                           # Backend tests
```

**Infrastructure (AWS SAM)**:
```
infrastructure/
├── template.yaml                    # SAM template (CloudFormation)
├── samconfig.toml                   # SAM CLI configuration
└── scripts/
    ├── deploy.sh                    # Deployment script
    └── local-invoke.sh              # Local testing script
```

### Animation System

The animation system uses a **priority-based hierarchy**:

1. **Lip Sync** (Priority 1) - Highest priority, always active during speech
2. **Gesture Animations** (Priority 2) - Context-driven gestures like greeting, nodding, explaining
3. **Emotion Expressions** (Priority 3) - Facial BlendShapes for emotions
4. **Idle Motions** (Priority 4) - Subtle background movements (breathing, blinking, looking around)

**Animation Files** (located in `frontend/public/assets/animations/`):
- `gestures/`: greeting.glb, pointing.glb, nodding.glb, thinking.glb, explaining.glb, celebrating.glb, shrugging.glb, agreeing.glb
- `idle/`: breathing.glb, blink.glb, lookAround.glb, stretch.glb, adjustClothes.glb, idleShift.glb

### Data Flow

```
User Input → Frontend Chat UI → Backend API (/api/chat)
  → OpenAI (response + emotion analysis)
  → Google TTS (audio synthesis)
  → Rhubarb (phoneme timeline extraction)
  → Frontend (JSON response with text, audio, phonemes, emotion)
  → Animation Controllers → Avatar Display
```

### API Integration (Planned)

**Endpoints**:
- `POST /api/chat` - Send message, receive AI response with audio and animation data
- `GET /api/health` - Health check

**Response Format**:
```typescript
{
  text: string;              // AI response text
  emotion: string;           // Detected emotion
  audioUrl: string;          // Audio file URL
  phonemes: Array<{          // Lip-sync data
    time: number;
    phoneme: string;
  }>;
}
```

## Current State

**Status**: Monorepo structure established, Frontend components partially implemented

**Completed**:
- ✅ Monorepo structure (frontend/, backend/, infrastructure/)
- ✅ Frontend: Vite + React + TypeScript + Tailwind CSS
- ✅ Frontend: VRM avatar display components
- ✅ Frontend: Basic animation controls
- ✅ Frontend: VRM animation hooks
- ✅ Infrastructure: SAM migration plan

**In Progress**:
- ⏳ Infrastructure: AWS SAM template implementation
- ⏳ Backend: FastAPI + Mangum implementation
- ⏳ Frontend: AI chat integration
- ⏳ Frontend: Lip-sync system
- ⏳ Frontend: Emotion controller

**Documentation**:
- Comprehensive specification documents in `document/` folder (Japanese)

## Phase 1 Constraints

**Not Supported**:
- Voice input (text-only)
- Multi-user support
- Conversation history persistence
- Custom avatar switching
- Camera input

**Technical Constraints**:
- WebGL 2.0 required
- VRM model size: ≤50MB
- Max simultaneous animations: 4
- Audio file size: ≤5MB

## Development Notes

### VRM Model Requirements
- Use VRM 1.0 or compatible format
- Must support BlendShapes for facial expressions
- Place in `frontend/public/assets/models/avatar.vrm`

### Animation Integration
- Use GLB format for animation clips
- Ensure animations are compatible with VRM bone structure
- Animation triggering based on AI response keywords/emotions

### State Management Approach
- Use Zustand for global state (avatar state, chat messages, animation queue)
- Keep Three.js/VRM state separate from React state where possible
- Use refs for Three.js objects to avoid unnecessary re-renders

### Performance Considerations
- Lazy load 3D models and animations
- Use DRACO compression for 3D assets when possible
- Implement proper cleanup for Three.js objects (dispose geometry/materials)
- Throttle animation updates to 60fps

## Browser Compatibility

**Supported**:
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

**Required Features**:
- WebGL 2.0
- ES2020+
- Web Audio API
- Fetch API

## Documentation

Comprehensive Japanese documentation available in `document/`:
- `01-プロジェクト概要.md` - Project overview and scope
- `02-システム構成.md` - System architecture with diagrams
- `03-技術スタック.md` - Technology stack details
- `04-アバター表示機能.md` - Avatar display specifications
- `05-アニメーション機能.md` - Animation system details
- `06-AI対話機能.md` - AI dialogue integration
- `07-UI-UX要件.md` - UI/UX requirements
- `08-非機能要件.md` - Non-functional requirements
- `09-データ構造.md` - Data structures
- `10-API仕様.md` - API specifications
- `11-ファイル構成.md` - File structure
- `12-開発スケジュール.md` - Development schedule (9 weeks)
- `13-テスト要件.md` - Testing requirements
- `14-デプロイメント.md` - Deployment
- `15-今後の拡張.md` - Future expansion plans
- `16-SAM移行計画.md` - AWS SAM migration plan (Terraform → SAM)

## Environment Setup

### Frontend (frontend/.env)
```bash
VITE_API_URL=http://localhost:8000
```

### Backend (backend/.env) - To be implemented
```bash
# AWS Configuration
AWS_REGION=ap-northeast-1
AWS_PROFILE=default

# Bedrock Configuration
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
BEDROCK_REGION=us-east-1

# Polly Configuration
POLLY_VOICE_ID=Takumi
POLLY_ENGINE=neural
```

### Infrastructure (infrastructure/samconfig.toml)
```toml
# SAM CLI configuration (auto-generated by `sam deploy --guided`)
# See infrastructure/samconfig.toml after first deployment
```

## Working with This Monorepo

**General Guidelines**:
1. Frontend development: Always `cd frontend` first
2. Backend development: Always `cd backend` first
3. Infrastructure changes: Always `cd infrastructure` first
4. Each directory has its own dependencies and tooling
5. Use `python local_server.py` for fast local backend development
6. Use `sam local start-api` to test in Lambda-like environment

**File Paths**:
- Frontend source code: `frontend/src/`
- Frontend assets: `frontend/public/assets/`
- Backend application: `backend/app/`
- Backend local server: `backend/local_server.py`
- SAM template: `infrastructure/template.yaml`
- Documentation: `document/` (root level)

**Local Development Workflow**:
```bash
# Terminal 1: Backend (FastAPI with hot reload)
cd backend
python local_server.py

# Terminal 2: Frontend (Vite with HMR)
cd frontend
npm run dev

# Access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```
