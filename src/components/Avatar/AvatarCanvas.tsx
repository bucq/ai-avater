import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { AvatarCanvasProps } from '../../types';
import VRMAvatar from './VRMAvatar';
import ExpressionControls from './ExpressionControls';
import AnimationControls from './AnimationControls';
import { useVRMAnimation } from '../../hooks/useVRMAnimation';
import { useVRMAnimationPlayer } from '../../hooks/useVRMAnimationPlayer';
import type { AnimationInfo } from '../../hooks/useVRMAnimationPlayer';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';

// カメラリセット機能を持つコンポーネント
const CameraController = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        // カメラ位置をリセット
        camera.position.set(0, 1.3, 2);

        // OrbitControlsのターゲットをリセット
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1, 0);
          controlsRef.current.update();
        }

        console.log('Camera reset to default position');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 1, 0]}
      enableDamping
      dampingFactor={0.05}
    />
  );
};

const AvatarCanvas = ({ modelUrl, className = '' }: AvatarCanvasProps) => {
  const [error, setError] = useState<string | null>(null);
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [currentExpression, setCurrentExpression] = useState<VRMExpressionPresetName | 'neutral'>('neutral');

  const vrmUrl = modelUrl || '/assets/models/avatar.vrm';

  // アニメーションフックを使用
  const { setExpression, setIdleEnabled } = useVRMAnimation(vrm);

  // VRMAアニメーションプレイヤー
  const {
    loadAnimations,
    playAnimation,
    stopAnimation,
    updateMixer,
    isPlaying,
    currentAnimation,
  } = useVRMAnimationPlayer(vrm, {
    onAnimationStart: () => {
      console.log('VRMA animation started, disabling idle animations');
      setIdleEnabled(false);
    },
    onAnimationEnd: () => {
      console.log('VRMA animation ended, enabling idle animations');
      setIdleEnabled(true);
    },
  });

  // 利用可能なアニメーション一覧
  const availableAnimations: AnimationInfo[] = [
    // 新規追加アニメーション
    { id: 'motion_pose', name: 'モーションポーズ', url: '/assets/animations/gestures/001_motion_pose.vrma' },
    { id: 'dogeza', name: '土下座', url: '/assets/animations/gestures/002_dogeza.vrma' },
    { id: 'humidai', name: '踏み台', url: '/assets/animations/gestures/003_humidai.vrma' },
    { id: 'hello', name: '挨拶', url: '/assets/animations/gestures/004_hello_1.vrma' },
    { id: 'smartphone', name: 'スマホ操作', url: '/assets/animations/gestures/005_smartphone.vrma' },
    { id: 'drinkwater', name: '水を飲む', url: '/assets/animations/gestures/006_drinkwater.vrma' },
    { id: 'gekirei', name: '激励', url: '/assets/animations/gestures/007_gekirei.vrma' },
    { id: 'gatan', name: 'ガタン', url: '/assets/animations/gestures/008_gatan.vrma' },
    // 既存のアニメーション
    { id: 'gesture1', name: 'ジェスチャー1', url: '/assets/animations/gestures/VRMA_01.vrma' },
    { id: 'gesture2', name: 'ジェスチャー2', url: '/assets/animations/gestures/VRMA_02.vrma' },
    { id: 'gesture3', name: 'ジェスチャー3', url: '/assets/animations/gestures/VRMA_03.vrma' },
    { id: 'gesture4', name: 'ジェスチャー4', url: '/assets/animations/gestures/VRMA_04.vrma' },
    { id: 'gesture5', name: 'ジェスチャー5', url: '/assets/animations/gestures/VRMA_05.vrma' },
    { id: 'gesture6', name: 'ジェスチャー6', url: '/assets/animations/gestures/VRMA_06.vrma' },
    { id: 'gesture7', name: 'ジェスチャー7', url: '/assets/animations/gestures/VRMA_07.vrma' },
  ];

  // VRM読み込み完了後にアニメーションをロード
  useEffect(() => {
    if (vrm) {
      console.log('Loading animations...');
      loadAnimations(availableAnimations).then(() => {
        console.log('All animations loaded');
      }).catch((err) => {
        console.error('Failed to load animations:', err);
      });
    }
  }, [vrm, loadAnimations]);

  // 表情変更ハンドラー
  const handleExpressionChange = (expression: VRMExpressionPresetName | 'neutral') => {
    setCurrentExpression(expression);
    setExpression(expression);
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const expressionMap: { [key: string]: VRMExpressionPresetName | 'neutral' } = {
        '1': 'neutral',
        '2': 'happy',
        '3': 'angry',
        '4': 'sad',
        '5': 'relaxed',
        '6': 'surprised',
      };

      const expression = expressionMap[e.key];
      if (expression) {
        handleExpressionChange(expression);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [setExpression]);

  return (
    <div className={`avatar-canvas-container ${className}`} style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 1.3, 2], fov: 30, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = 'srgb';
        }}
      >
        <color attach="background" args={['#f0f0f0']} />

        <directionalLight position={[1, 1, 1]} intensity={Math.PI} />
        <ambientLight intensity={0.5} />

        <Suspense fallback={null}>
          <VRMAvatar
            url={vrmUrl}
            onError={setError}
            onLoaded={setVrm}
            onUpdate={updateMixer}
          />
        </Suspense>

        <CameraController />
      </Canvas>

      {error && (
        <div className="error-message" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p>{error}</p>
        </div>
      )}

      <ExpressionControls
        onExpressionChange={handleExpressionChange}
        currentExpression={currentExpression}
      />

      <AnimationControls
        animations={availableAnimations}
        onAnimationSelect={playAnimation}
        currentAnimation={currentAnimation}
        isPlaying={isPlaying}
        onStop={stopAnimation}
      />

      <div className="controls-hint" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <p style={{ margin: 0 }}>カメラ操作: マウスドラッグ</p>
        <p style={{ margin: '5px 0 0 0' }}>リセット: <strong>R</strong>キー</p>
      </div>
    </div>
  );
};

export default AvatarCanvas;
