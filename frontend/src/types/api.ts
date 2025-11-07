/**
 * API type definitions
 * Matches backend schemas (backend/app/models/schemas.py)
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: Message[];
}

export interface MouthCue {
  start: number;
  end: number;
  value: string;
}

export interface LipSyncData {
  duration: number;
  mouth_cues: MouthCue[];
}

export interface ChatResponse {
  text: string;
  emotion: string;
  intensity: number;
  keywords: string[];
  audio_url: string;
  lip_sync_data: LipSyncData;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  ai_backend: string;
}
