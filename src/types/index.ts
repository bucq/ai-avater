import { VRM } from '@pixiv/three-vrm';

export interface AvatarState {
  vrm: VRM | null;
  isLoading: boolean;
  error: string | null;
}

export interface AvatarCanvasProps {
  modelUrl?: string;
  className?: string;
}
