'use client';

/**
 * TwinFleet - 3D Digital Twin Fleet Visualization
 * Displays all school twins in an immersive 3D scene
 * Falls back to 2D view if WebGL is unavailable
 */

import { Suspense, useState, useMemo, useEffect, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, PerspectiveCamera, Html } from '@react-three/drei';
import { TwinCharacter } from './TwinCharacter';
import { SCHOOL_DATABASE } from '@/lib/data/schools';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { safeSortBy } from '@/lib/utils/safeValue';
import type { SchoolProbability } from '@/lib/types/student';

// Error boundary to catch Three.js rendering errors
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('TwinFleet: 3D rendering error:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Check if WebGL is available
function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') {
    console.log('TwinFleet: SSR - WebGL check skipped');
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    // Try WebGL2 first, then WebGL1
    const gl = canvas.getContext('webgl2') ||
               canvas.getContext('webgl') ||
               canvas.getContext('experimental-webgl');

    const hasWebGLContext = !!gl;
    const hasWebGLRenderingContext = !!(window.WebGLRenderingContext || window.WebGL2RenderingContext);

    console.log('TwinFleet: WebGL diagnostics:', {
      hasWebGLRenderingContext,
      hasWebGLContext,
      contextType: gl ? (gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1') : 'none',
      userAgent: navigator.userAgent.substring(0, 50) + '...',
    });

    // If we got a context, WebGL is available
    if (hasWebGLContext) {
      console.log('TwinFleet: WebGL is available');
      return true;
    }

    console.log('TwinFleet: WebGL not available - no context obtained');
    return false;
  } catch (e) {
    console.error('TwinFleet: WebGL check error:', e);
    return false;
  }
}

interface TwinFleetProps {
  schoolProbabilities: SchoolProbability[];
  onSelectTwin?: (schoolId: string) => void;
  selectedTwin?: string | null;
}

// Loading component for Suspense
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-[#FF4A23] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading Fleet...</p>
      </div>
    </Html>
  );
}

// Floor/Platform
function Platform() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <circleGeometry args={[15, 64]} />
      <meshStandardMaterial
        color="#1a1a2e"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// Ambient particles
function Particles() {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4A90D9" transparent opacity={0.6} />
    </points>
  );
}

// Scene content
function FleetScene({
  schoolProbabilities,
  selectedTwin,
  onSelectTwin,
}: TwinFleetProps) {
  // Calculate positions in a circular formation
  const twinData = useMemo(() => {
    const count = schoolProbabilities.length;
    const radius = Math.max(4, count * 0.8);

    // Use safeSortBy to avoid mutating frozen arrays from Zustand store
    return safeSortBy(schoolProbabilities, (s) => s.p_final, true)
      .map((school, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const schoolData = SCHOOL_DATABASE[school.school_id];

        return {
          ...school,
          position: [x, 0, z] as [number, number, number],
          color: schoolData?.twin_color || '#4A90D9',
        };
      });
  }, [schoolProbabilities]);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 3, 12]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#4A90D9" />
      <pointLight position={[10, 5, 10]} intensity={0.5} color="#10B981" />

      {/* Environment */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <Particles />
      <Platform />

      {/* Twin Characters */}
      {twinData.map((twin) => (
        <TwinCharacter
          key={twin.school_id}
          schoolColor={twin.color}
          schoolName={twin.school_name}
          probability={twin.p_final}
          fitLevel={twin.fit_level}
          position={twin.position}
          isSelected={selectedTwin === twin.school_id}
          onClick={() => onSelectTwin?.(twin.school_id)}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={!selectedTwin}
        autoRotateSpeed={0.5}
      />

      {/* Environment map for reflections */}
      <Environment preset="night" />
    </>
  );
}

// 2D Fallback component when WebGL is not available
function TwinFleet2D({
  schoolProbabilities,
  onSelectTwin,
  selectedTwin,
}: TwinFleetProps) {
  const sortedSchools = [...schoolProbabilities].sort((a, b) => b.p_final - a.p_final);

  const getFitStyles = (fit: string) => {
    switch (fit) {
      case 'BEST_FIT': return { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' };
      case 'STRONG_FIT': return { borderColor: '#4A90D9', backgroundColor: 'rgba(74, 144, 217, 0.2)' };
      case 'TOUGH': return { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' };
      default: return { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' };
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full overflow-y-auto">
        {sortedSchools.map((school) => {
          const schoolData = SCHOOL_DATABASE[school.school_id];
          const isSelected = selectedTwin === school.school_id;
          const fitStyles = getFitStyles(school.fit_level);

          return (
            <button
              key={school.school_id}
              onClick={() => onSelectTwin?.(school.school_id)}
              className={cn(
                'flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]'
              )}
              style={fitStyles}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: schoolData?.twin_color || '#4A90D9' }}
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-medium text-center line-clamp-2">
                {school.school_name}
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {(school.p_final * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-white/60 mt-1">
                {school.fit_level.replace('_', ' ')}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Set to true to bypass WebGL check and force 3D rendering attempt
// Note: Set to false because WebGL is often unavailable on many systems
const FORCE_3D_RENDERING = false;

export function TwinFleet({
  schoolProbabilities,
  onSelectTwin,
  selectedTwin,
}: TwinFleetProps) {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const available = isWebGLAvailable();
    console.log('TwinFleet: Setting webGLAvailable to', available);
    // If FORCE_3D_RENDERING is true, try 3D anyway and let error boundary catch failures
    setWebGLAvailable(FORCE_3D_RENDERING ? true : available);
  }, []);

  const handleCanvasError = (error: Error) => {
    console.error('TwinFleet: Canvas error, falling back to 2D:', error.message);
    setHasError(true);
  };

  if (!schoolProbabilities || schoolProbabilities.length === 0) {
    console.log('TwinFleet: No schools to display');
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] rounded-2xl">
        <p className="text-white/60">No schools to display</p>
      </div>
    );
  }

  // Show loading while checking WebGL
  if (webGLAvailable === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[#FF4A23] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading Fleet...</p>
        </div>
      </div>
    );
  }

  // Use 2D fallback if WebGL not available or if there was an error
  if (!webGLAvailable || hasError) {
    console.log('TwinFleet: Using 2D fallback - webGLAvailable:', webGLAvailable, 'hasError:', hasError);
    return (
      <TwinFleet2D
        schoolProbabilities={schoolProbabilities}
        onSelectTwin={onSelectTwin}
        selectedTwin={selectedTwin}
      />
    );
  }

  console.log('TwinFleet: Rendering 3D canvas with', schoolProbabilities.length, 'schools');

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      <CanvasErrorBoundary
        fallback={
          <TwinFleet2D
            schoolProbabilities={schoolProbabilities}
            onSelectTwin={onSelectTwin}
            selectedTwin={selectedTwin}
          />
        }
        onError={handleCanvasError}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            failIfMajorPerformanceCaveat: false,
            powerPreference: 'default',
          }}
          onCreated={(state) => {
            console.log('TwinFleet: Canvas created successfully', state.gl.info);
            setHasError(false);
          }}
        >
          <Suspense fallback={<Loader />}>
            <FleetScene
              schoolProbabilities={schoolProbabilities}
              selectedTwin={selectedTwin}
              onSelectTwin={onSelectTwin}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs">
        <p className="text-white/60 mb-2">Fit Levels:</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-white/80">Best Fit</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4A90D9]" />
            <span className="text-white/80">Strong</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-white/80">Tough</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-white/80">Long Shot</span>
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/60">
        Drag to rotate • Scroll to zoom • Click a twin to select
      </div>
    </div>
  );
}

// Compact version for dashboard cards
export function TwinFleetMini({
  schoolProbabilities,
  height = 200,
}: {
  schoolProbabilities: SchoolProbability[];
  height?: number;
}) {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]" style={{ height }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={40} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Stars radius={50} depth={30} count={500} factor={2} saturation={0} fade speed={1} />

          {schoolProbabilities.slice(0, 4).map((school, index) => {
            const x = (index - 1.5) * 2;
            const schoolData = SCHOOL_DATABASE[school.school_id];
            return (
              <TwinCharacter
                key={school.school_id}
                schoolColor={schoolData?.twin_color || '#4A90D9'}
                schoolName={school.school_name}
                probability={school.p_final}
                fitLevel={school.fit_level}
                position={[x, 0, 0]}
              />
            );
          })}

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
