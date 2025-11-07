import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils, VRMHumanBoneName } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 自然な立ち姿のポーズを設定する関数
const setNaturalStandingPose = (vrm: VRM) => {
  if (!vrm.humanoid) return;

  // 左腕の角度を下げる（自然な位置に）
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm);
  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm);
  const leftHand = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand);

  if (leftUpperArm) {
    // 左腕を体の横に下ろす（Z軸回転で腕を下げる）
    leftUpperArm.rotation.z = -1.35; // 約17度
  }
  if (leftLowerArm) {
    // 肘を少し曲げる
    // leftLowerArm.rotation.z = -0.1;

  }
  if (leftHand) {
    // 手を自然な角度に
    leftHand.rotation.z = 0.1;
  }

  // 右腕の角度を下げる（自然な位置に）
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm);
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm);
  const rightHand = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand);

  if (rightUpperArm) {
    // 右腕を体の横に下ろす（Z軸回転で腕を下げる）
    rightUpperArm.rotation.z = 1.35; // 約-17度
  }
  if (rightLowerArm) {
    // 肘を少し曲げる
    // rightLowerArm.rotation.z = 0.1;
  }
  if (rightHand) {
    // 手を自然な角度に
    rightHand.rotation.z = -0.1;
  }

  console.log('Natural standing pose applied');
};

interface VRMAvatarProps {
  url: string;
  onError?: (error: string) => void;
  onLoaded?: (vrm: VRM) => void;
  onUpdate?: (delta: number) => void;
}

const VRMAvatar = ({ url, onError, onLoaded, onUpdate }: VRMAvatarProps) => {
  const vrmRef = useRef<VRM | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;

        if (vrm) {
          vrmRef.current = vrm;

          // VRMUtils.rotateVRM0 は不要な回転を削除します
          VRMUtils.rotateVRM0(vrm);

          // 自然な立ち姿のポーズを設定
          setNaturalStandingPose(vrm);

          // groupRefにVRMシーンを追加
          if (groupRef.current) {
            groupRef.current.add(vrm.scene);
          }

          console.log('VRM model loaded successfully');

          // コールバック実行
          if (onLoaded) {
            onLoaded(vrm);
          }
        }
      },
      (progress) => {
        console.log(
          'Loading model...',
          100 * (progress.loaded / progress.total),
          '%'
        );
      },
      (error) => {
        console.error('Error loading VRM:', error);
        if (onError) {
          onError('VRMモデルの読み込みに失敗しました。モデルのパスを確認してください。');
        }
      }
    );

    return () => {
      if (vrmRef.current && groupRef.current) {
        groupRef.current.remove(vrmRef.current.scene);
        VRMUtils.deepDispose(vrmRef.current.scene);
      }
    };
  }, [url, onError, onLoaded, onUpdate]);

  // VRMのアップデートをフレームごとに実行
  useFrame((_state, delta) => {
    if (vrmRef.current) {
      vrmRef.current.update(delta);
    }

    // アニメーションミキサーの更新などを親に通知
    if (onUpdate) {
      onUpdate(delta);
    }
  });

  return <group ref={groupRef} />;
};

export default VRMAvatar;
