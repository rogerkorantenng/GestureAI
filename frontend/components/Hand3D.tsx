'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { HandPose, DEFAULT_POSE } from '@/lib/handPoses';

interface FingerProps {
  position: [number, number, number];
  rotation: [number, number, number];
  curl: number;
  length?: number;
  thickness?: number;
  segments?: number;
}

function Finger({ position, rotation, curl, length = 0.8, thickness = 0.12, segments = 3 }: FingerProps) {
  const segmentLength = length / segments;
  const curlAngle = curl * (Math.PI / 2.5); // Max curl angle

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: segments }).map((_, i) => {
        const yOffset = i * segmentLength * 0.95;
        const segmentCurl = curlAngle * (i + 1) / segments;

        return (
          <group key={i} position={[0, yOffset, 0]} rotation={[segmentCurl, 0, 0]}>
            <mesh position={[0, segmentLength / 2, 0]}>
              <capsuleGeometry args={[thickness * (1 - i * 0.15), segmentLength * 0.8, 8, 16]} />
              <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Knuckle */}
            {i < segments - 1 && (
              <mesh position={[0, segmentLength, 0]}>
                <sphereGeometry args={[thickness * (1 - i * 0.1), 16, 16]} />
                <meshStandardMaterial color="#ddb3a0" roughness={0.7} metalness={0.1} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

interface ThumbProps {
  position: [number, number, number];
  curl: number;
  spread: number;
}

function Thumb({ position, curl, spread }: ThumbProps) {
  const curlAngle = curl * (Math.PI / 3);
  const spreadAngle = spread * (Math.PI / 4);

  return (
    <group position={position} rotation={[0, 0, spreadAngle + Math.PI / 6]}>
      {/* Base segment */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.1, 0.25, 8, 16]} />
        <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Middle segment */}
      <group position={[0.28, 0.15, 0]} rotation={[curlAngle * 0.5, 0, -Math.PI / 6]}>
        <mesh position={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.2, 8, 16]} />
          <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Tip segment */}
        <group position={[0.22, 0, 0]} rotation={[curlAngle * 0.5, 0, 0]}>
          <mesh position={[0.08, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.15, 8, 16]} />
            <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

interface HandModelProps {
  pose: HandPose;
  isAnimating?: boolean;
}

function HandModel({ pose, isAnimating = false }: HandModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && isAnimating) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const fingerPositions: { name: keyof Omit<HandPose, 'wristRotation' | 'palmDirection'>; x: number; spread: number }[] = [
    { name: 'index', x: -0.15, spread: 0.1 },
    { name: 'middle', x: -0.05, spread: 0 },
    { name: 'ring', x: 0.05, spread: 0 },
    { name: 'pinky', x: 0.15, spread: -0.1 },
  ];

  return (
    <group
      ref={groupRef}
      rotation={[
        pose.wristRotation.x,
        pose.wristRotation.y,
        pose.wristRotation.z,
      ]}
    >
      {/* Palm */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.15]} />
        <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Palm detail - slight curve */}
      <mesh position={[0, 0, -0.05]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ddb3a0" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Fingers */}
      {fingerPositions.map(({ name, x, spread: baseSpread }) => {
        const fingerPose = pose[name];
        const spreadOffset = fingerPose.spread * 0.15;

        return (
          <Finger
            key={name}
            position={[x + spreadOffset, 0.3, 0]}
            rotation={[0, 0, baseSpread + fingerPose.spread * 0.3]}
            curl={fingerPose.curl}
            length={name === 'pinky' ? 0.6 : name === 'ring' ? 0.75 : 0.8}
            thickness={name === 'pinky' ? 0.09 : 0.11}
          />
        );
      })}

      {/* Thumb */}
      <Thumb
        position={[-0.25, -0.1, 0.05]}
        curl={pose.thumb.curl}
        spread={pose.thumb.spread}
      />

      {/* Wrist */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.3, 16]} />
        <meshStandardMaterial color="#e8beac" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

interface Hand3DProps {
  pose?: HandPose;
  isAnimating?: boolean;
  className?: string;
  showControls?: boolean;
}

export function Hand3D({
  pose = DEFAULT_POSE,
  isAnimating = false,
  className = '',
  showControls = true,
}: Hand3DProps) {
  return (
    <div className={`w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.5} />

        <HandModel pose={pose} isAnimating={isAnimating} />

        {showControls && (
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3 / 4}
          />
        )}

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}

// Wrapper for dynamic loading (fixes SSR issues)
export function Hand3DWrapper(props: Hand3DProps) {
  return <Hand3D {...props} />;
}
