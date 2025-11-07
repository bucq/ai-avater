import { useState, useCallback, useRef, useEffect } from 'react';
import { VRM } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import type { VRMAnimation } from '@pixiv/three-vrm-animation';
import * as THREE from 'three';

export interface AnimationInfo {
  id: string;
  name: string;
  url: string;
}

interface AnimationPlayerCallbacks {
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

export const useVRMAnimationPlayer = (vrm: VRM | null, callbacks?: AnimationPlayerCallbacks) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [loadedAnimations, setLoadedAnimations] = useState<Map<string, VRMAnimation>>(new Map());

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // VRMが読み込まれたらミキサーを初期化
  useEffect(() => {
    if (vrm && !mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(vrm.scene);
      console.log('AnimationMixer initialized');
    }
  }, [vrm]);

  // アニメーションクリップをロード
  const loadAnimation = useCallback(async (animationInfo: AnimationInfo): Promise<void> => {
    if (!vrm) {
      console.error('VRM not loaded');
      return;
    }

    // すでにロード済みの場合はスキップ
    if (loadedAnimations.has(animationInfo.id)) {
      console.log(`Animation ${animationInfo.id} already loaded`);
      return;
    }

    try {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

      return new Promise((resolve, reject) => {
        loader.load(
          animationInfo.url,
          (gltf) => {
            const vrmAnimations = gltf.userData.vrmAnimations;
            if (vrmAnimations && vrmAnimations.length > 0) {
              const vrmAnimation = vrmAnimations[0] as VRMAnimation;

              setLoadedAnimations(prev => {
                const newMap = new Map(prev);
                newMap.set(animationInfo.id, vrmAnimation);
                return newMap;
              });

              console.log(`Animation ${animationInfo.name} loaded successfully`);
              resolve();
            } else {
              reject(new Error('No VRM animations found in file'));
            }
          },
          undefined,
          (error) => {
            console.error(`Error loading animation ${animationInfo.name}:`, error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error in loadAnimation:', error);
      throw error;
    }
  }, [vrm, loadedAnimations]);

  // 複数のアニメーションを一括ロード
  const loadAnimations = useCallback(async (animations: AnimationInfo[]): Promise<void> => {
    if (!vrm) return;

    const loadPromises = animations.map(anim => loadAnimation(anim));
    await Promise.all(loadPromises);
  }, [vrm, loadAnimation]);

  // アニメーションを再生
  const playAnimation = useCallback((animationId: string) => {
    if (!vrm || !mixerRef.current) {
      console.error('VRM or mixer not initialized');
      return;
    }

    const vrmAnimation = loadedAnimations.get(animationId);
    if (!vrmAnimation) {
      console.error(`Animation ${animationId} not loaded`);
      return;
    }

    // 現在のアニメーションを停止
    if (currentActionRef.current) {
      currentActionRef.current.stop();
      mixerRef.current.uncacheAction(currentActionRef.current.getClip());
    }

    // アニメーション開始コールバック
    if (callbacks?.onAnimationStart) {
      callbacks.onAnimationStart();
    }

    // 新しいアニメーションを再生
    const clip = createVRMAnimationClip(vrmAnimation, vrm);
    const action = mixerRef.current.clipAction(clip);

    action.reset();
    action.fadeIn(0.3);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();

    currentActionRef.current = action;
    setIsPlaying(true);
    setCurrentAnimation(animationId);

    // アニメーション終了時のイベント
    const onFinished = () => {
      setIsPlaying(false);
      setCurrentAnimation(null);
      mixerRef.current?.removeEventListener('finished', onFinished);

      // アニメーション終了コールバック
      if (callbacks?.onAnimationEnd) {
        callbacks.onAnimationEnd();
      }
    };
    mixerRef.current.addEventListener('finished', onFinished);

    console.log(`Playing animation: ${animationId}`);
  }, [vrm, loadedAnimations, callbacks]);

  // アニメーションを停止
  const stopAnimation = useCallback(() => {
    if (currentActionRef.current && mixerRef.current) {
      currentActionRef.current.stop();
      mixerRef.current.uncacheAction(currentActionRef.current.getClip());
      currentActionRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAnimation(null);

    // アニメーション終了コールバック
    if (callbacks?.onAnimationEnd) {
      callbacks.onAnimationEnd();
    }
  }, [callbacks]);

  // ミキサーの更新（useFrameの代わり）
  const updateMixer = useCallback((delta: number) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  }, []);

  return {
    loadAnimation,
    loadAnimations,
    playAnimation,
    stopAnimation,
    updateMixer,
    isPlaying,
    currentAnimation,
    loadedAnimations: Array.from(loadedAnimations.keys()),
  };
};
