'use client';

/**
 * TwinCharacter - 3D Digital Twin representation
 * A stylized avatar that represents the student's profile at a specific school
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

type FitLevel = 'BEST_FIT' | 'STRONG_FIT' | 'TOUGH' | 'LONG_SHOT' | 'WORST_FIT';

interface TwinCharacterProps {
  schoolColor: string;
  schoolName: string;
  probability: number;
  fitLevel: FitLevel;
  isSelected?: boolean;
  position?: [number, number, number];
  onClick?: () => void;
}

export function TwinCharacter({
  schoolColor,
  schoolName,
  probability,
  fitLevel,
  isSelected = false,
  position = [0, 0, 0],
  onClick,
}: TwinCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Convert hex color to THREE color
  const color = useMemo(() => new THREE.Color(schoolColor), [schoolColor]);
  const glowColor = useMemo(() => {
    const c = new THREE.Color(schoolColor);
    c.multiplyScalar(1.5);
    return c;
  }, [schoolColor]);

  // Fit level affects character appearance
  const characterScale = useMemo(() => {
    switch (fitLevel) {
      case 'BEST_FIT': return 1.2;
      case 'STRONG_FIT': return 1.1;
      case 'TOUGH': return 1.0;
      case 'LONG_SHOT': return 0.9;
      default: return 1.0;
    }
  }, [fitLevel]);

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;

      // Subtle rotation
      if (!isSelected) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      }
    }

    if (glowRef.current) {
      // Pulsing glow based on probability
      const pulseIntensity = 0.3 + probability * 0.7;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + pulseIntensity;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.3;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick} scale={isSelected ? 1.2 : 1}>
      {/* Selection highlight ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color={schoolColor} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Character body - stylized avatar */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group scale={characterScale}>
          {/* Head */}
          <Sphere args={[0.4, 32, 32]} position={[0, 0.8, 0]}>
            <MeshDistortMaterial
              color={color}
              distort={0.1}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>

          {/* Eyes - simple dots */}
          <mesh position={[-0.12, 0.85, 0.35]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.12, 0.85, 0.35]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Pupils */}
          <mesh position={[-0.12, 0.85, 0.4]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[0.12, 0.85, 0.4]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>

          {/* Body */}
          <RoundedBox args={[0.6, 0.8, 0.4]} radius={0.15} smoothness={4} position={[0, 0, 0]}>
            <MeshDistortMaterial
              color={color}
              distort={0.05}
              speed={1}
              roughness={0.3}
              metalness={0.6}
            />
          </RoundedBox>

          {/* Arms */}
          <RoundedBox args={[0.15, 0.5, 0.15]} radius={0.05} smoothness={4} position={[-0.45, 0.1, 0]} rotation={[0, 0, 0.3]}>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.15, 0.5, 0.15]} radius={0.05} smoothness={4} position={[0.45, 0.1, 0]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </RoundedBox>

          {/* Legs */}
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={0.05} smoothness={4} position={[-0.15, -0.55, 0]}>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={0.05} smoothness={4} position={[0.15, -0.55, 0]}>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </RoundedBox>

          {/* Probability badge - floating above head */}
          <group position={[0, 1.4, 0]}>
            <RoundedBox args={[0.5, 0.25, 0.1]} radius={0.05} smoothness={4}>
              <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
            </RoundedBox>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {`${(probability * 100).toFixed(0)}%`}
            </Text>
          </group>
        </group>
      </Float>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>

      {/* School name label */}
      <Text
        position={[0, -1.1, 0]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {schoolName}
      </Text>

      {/* Fit level indicator */}
      <Text
        position={[0, -1.35, 0]}
        fontSize={0.12}
        color={
          fitLevel === 'BEST_FIT' ? '#10B981' :
          fitLevel === 'STRONG_FIT' ? '#4A90D9' :
          fitLevel === 'TOUGH' ? '#F59E0B' :
          '#EF4444'
        }
        anchorX="center"
        anchorY="middle"
      >
        {fitLevel.replace('_', ' ')}
      </Text>
    </group>
  );
}
