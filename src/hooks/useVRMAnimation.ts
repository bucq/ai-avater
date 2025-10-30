import { useEffect, useRef, useCallback } from 'react';
import { VRM, VRMExpressionPresetName, VRMHumanBoneName } from '@pixiv/three-vrm';

export interface AnimationState {
  currentExpression: VRMExpressionPresetName | 'neutral';
  isBlinking: boolean;
  isBreathing: boolean;
  isIdleEnabled: boolean;
}

export const useVRMAnimation = (vrm: VRM | null) => {
  const animationStateRef = useRef<AnimationState>({
    currentExpression: 'neutral',
    isBlinking: false,
    isBreathing: true,
    isIdleEnabled: true,
  });
  const lastBlinkTimeRef = useRef<number>(0);
  const nextBlinkDelayRef = useRef<number>(3000);
  const breathingPhaseRef = useRef<number>(0);

  // 表情を設定する関数
  const setExpression = useCallback((expression: VRMExpressionPresetName | 'neutral', weight: number = 1.0) => {
    if (!vrm?.expressionManager) return;

    // すべての表情をリセット
    const expressionManager = vrm.expressionManager;
    const presets: VRMExpressionPresetName[] = ['happy', 'angry', 'sad', 'relaxed', 'surprised'];

    presets.forEach(preset => {
      expressionManager.setValue(preset, 0);
    });

    // 新しい表情を設定
    if (expression !== 'neutral') {
      expressionManager.setValue(expression, weight);
    }

    animationStateRef.current.currentExpression = expression;
  }, [vrm]);

  // まばたきを実行
  const blink = useCallback(() => {
    if (!vrm?.expressionManager) return;

    animationStateRef.current.isBlinking = true;
    vrm.expressionManager.setValue('blink', 1.0);

    // 0.2秒後に目を開ける
    setTimeout(() => {
      if (vrm?.expressionManager) {
        vrm.expressionManager.setValue('blink', 0);
        animationStateRef.current.isBlinking = false;
      }
    }, 200);
  }, [vrm]);

  // 自動まばたき
  useEffect(() => {
    if (!vrm) return;

    const animateBlinking = (currentTime: number) => {
      if (currentTime - lastBlinkTimeRef.current > nextBlinkDelayRef.current) {
        blink();
        lastBlinkTimeRef.current = currentTime;
        // 次のまばたきまでのランダムな時間（2-5秒）
        nextBlinkDelayRef.current = 2000 + Math.random() * 3000;
      }

      requestAnimationFrame(animateBlinking);
    };

    const animationId = requestAnimationFrame(animateBlinking);

    return () => cancelAnimationFrame(animationId);
  }, [vrm, blink]);

  // 呼吸アニメーション
  useEffect(() => {
    if (!vrm) return;

    const animateBreathing = () => {
      if (!animationStateRef.current.isBreathing || !animationStateRef.current.isIdleEnabled || !vrm.humanoid) {
        requestAnimationFrame(animateBreathing);
        return;
      }

      breathingPhaseRef.current += 0.02;
      const breathingScale = Math.sin(breathingPhaseRef.current) * 0.01 + 1.0;

      // 胸と腰の動きで呼吸を表現
      const chest = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest);
      const spine = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine);

      if (chest) {
        chest.scale.set(breathingScale, breathingScale, breathingScale);
      }
      if (spine) {
        spine.rotation.x = Math.sin(breathingPhaseRef.current) * 0.01;
      }

      requestAnimationFrame(animateBreathing);
    };

    const animationId = requestAnimationFrame(animateBreathing);

    return () => cancelAnimationFrame(animationId);
  }, [vrm]);

  // アイドル時の微細な動き
  useEffect(() => {
    if (!vrm || !vrm.humanoid) return;

    let idlePhase = 0;
    const animateIdle = () => {
      if (animationStateRef.current.isIdleEnabled) {
        idlePhase += 0.01;

        const head = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
        if (head) {
          // 頭を少し動かす
          head.rotation.y = Math.sin(idlePhase * 0.5) * 0.05;
          head.rotation.x = Math.sin(idlePhase * 0.3) * 0.02;
        }
      }

      requestAnimationFrame(animateIdle);
    };

    const animationId = requestAnimationFrame(animateIdle);

    return () => cancelAnimationFrame(animationId);
  }, [vrm]);

  // アイドルアニメーションの制御
  const setIdleEnabled = useCallback((enabled: boolean) => {
    animationStateRef.current.isIdleEnabled = enabled;
  }, []);

  return {
    setExpression,
    blink,
    setIdleEnabled,
    animationState: animationStateRef.current,
  };
};
