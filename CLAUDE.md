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

## Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### TypeScript
```bash
# Type check
tsc -b

# Type check with watch mode
tsc -b --watch
```

## Architecture

### System Architecture (Phase 1)

This is a **separated frontend-only project** (currently in initial setup). The full system will have:

**Frontend (This Repository)**:
- **Build Tool**: Vite 5.x (chosen for fast HMR, excellent Three.js compatibility)
- **Framework**: React 19.x with TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **3D Rendering**: Three.js + @pixiv/three-vrm for VRM avatar support
- **Animation**: GSAP for smooth animations
- **State Management**: Zustand (planned)
- **API Communication**: Axios (planned)

**Backend (Separate)**:
- FastAPI with Python 3.12+
- OpenAI API (GPT-4) for dialogue generation
- Google Cloud TTS for speech synthesis
- Rhubarb Lip Sync for phoneme extraction

### Key Design Decisions

**Why Vite + React (not Next.js)?**
- No need for SSR/SSG (SPA architecture)
- Fast HMR is critical for animation development iteration
- Excellent Three.js ecosystem compatibility
- Clean separation between frontend and backend services

**Component Architecture** (Planned):
```
src/
├── components/
│   ├── Avatar/          # 3D avatar rendering and control
│   │   ├── AvatarCanvas.tsx
│   │   ├── AvatarController.ts
│   │   ├── AnimationManager.ts      # Animation priority system
│   │   ├── LipSyncController.ts     # Mouth movement sync
│   │   ├── EmotionController.ts     # Facial expressions
│   │   └── IdleMotionController.ts  # Background animations
│   ├── Chat/            # Chat UI components
│   └── UI/              # Shared UI components
├── hooks/               # Custom React hooks
├── services/            # API and audio services
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

### Animation System

The animation system uses a **priority-based hierarchy**:

1. **Lip Sync** (Priority 1) - Highest priority, always active during speech
2. **Gesture Animations** (Priority 2) - Context-driven gestures like greeting, nodding, explaining
3. **Emotion Expressions** (Priority 3) - Facial BlendShapes for emotions
4. **Idle Motions** (Priority 4) - Subtle background movements (breathing, blinking, looking around)

**Animation Files** (located in `public/assets/animations/`):
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

**Status**: Initial Vite + React + TypeScript setup
- Default Vite React template in place
- No custom components implemented yet
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
- Place in `public/assets/models/avatar.vrm`

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

## Environment Setup

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
```

### Backend (.env) - For Reference
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```
