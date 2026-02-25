/// <reference types="@react-three/fiber" />
'use client';

import * as THREE from 'three';
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber';
import {
  useGLTF,
  useAnimations,
  Environment,
  ContactShadows,
  PresentationControls,
  Float,
  Bounds,
  Html,
  Points,
  PointMaterial,
  useProgress,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader as LoaderIcon,
  Cloud,
  Zap,
  Droplets,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';

const MODEL_URL = '/RobotExpressive.glb';

/* ----------------------------- TYPES & INTERFACES ----------------------------- */
interface LoadingProgress {
  progress: number;
  phase:
    | 'initializing'
    | 'loading-3d'
    | 'loading-data'
    | 'connecting'
    | 'ready';
  message: string;
}

interface SplashScreenProps {
  isFadingOut: boolean;
  onComplete?: () => void;
}

/* ----------------------------- UTILS ----------------------------- */
function easeInOutSine(t: number): number {
  return 0.5 * (1 - Math.cos(Math.PI * t));
}

function generateParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const spread = 25;
  const height = 15;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread; // X
    positions[i * 3 + 1] = Math.random() * height; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread; // Z
  }
  return positions;
}

/* ----------------------------- RAIN PARTICLE SYSTEM ----------------------------- */
function RainParticles({ count = 1500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => generateParticlePositions(count), [count]);

  useFrame((state, delta) => {
    if (!points.current) return;

    const positionsArray = points.current.geometry.attributes.position
      .array as Float32Array;
    const speed = 2;

    for (let i = 1; i < positionsArray.length; i += 3) {
      positionsArray[i] -= delta * speed;
      if (positionsArray[i] < -5) {
        positionsArray[i] = 10;
        positionsArray[i - 1] = (Math.random() - 0.5) * 20;
        positionsArray[i + 1] = (Math.random() - 0.5) * 20;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#aaddff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
}

/* ----------------------------- ENHANCED ROBOT COMPONENT ----------------------------- */
function RobotModel({
  idle = 'Wave',
  onModelError,
}: {
  idle?: string;
  onModelError: (error: any) => void;
}) {
  const group = useRef<THREE.Group>(null);

  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, mixer } = useAnimations(animations, group);

  const prepared = useMemo(() => {
    if (!scene) return null;

    scene.traverse((object: any) => {
      if (object.isMesh) {
        object.castShadow = object.receiveShadow = true;
        if (object.material) {
          object.material.envMapIntensity = 0.8;
          object.material.roughness = object.material.roughness ?? 0.5;
          object.material.metalness = object.material.metalness ?? 0.3;

          if (object.material.emissive) {
            object.material.emissive.setHex(0x000000);
            object.material.emissiveIntensity = 0;
          }
        }
      }
    });
    return scene;
  }, [scene]);

  useEffect(() => {
    if (!actions?.[idle]) return;

    const action = actions[idle];
    action.reset().fadeIn(0.5).play();
    action.setLoop(THREE.LoopRepeat, Infinity);

    return () => {
      Object.values(actions).forEach((action) => {
        action?.fadeOut(0.3).stop();
      });
    };
  }, [actions, idle]);

  const movementState = useRef({
    time: 0,
    baseY: -0.1,
    amplitude: 0.02,
  });

  useFrame((state, delta) => {
    if (!group.current) return;

    movementState.current.time += delta;
    const t = movementState.current.time;

    const x = 0;
    const z = 1.5;
    const y =
      movementState.current.baseY +
      Math.sin(t * 1.5) * movementState.current.amplitude;

    group.current.position.set(x, y, z);
    group.current.rotation.y = 0;
    group.current.rotation.x = 0;
    group.current.rotation.z = 0;
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!mixer) return;
      mixer.timeScale = document.hidden ? 0 : 1;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mixer]);

  if (!prepared) return null;

  return (
    <group ref={group} scale={0.8}>
      <Float speed={1.2} floatIntensity={0.12} rotationIntensity={0.08}>
        <primitive object={prepared} />
      </Float>
    </group>
  );
}

// Komponen Error Boundary sederhana untuk menangkap error dari Suspense
class ErrorBoundary extends React.Component<
  {
    fallback: React.ReactNode;
    children: React.ReactNode;
    onError: (error: any, errorInfo: any) => void;
  },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Robot({ idle = 'Wave' }: { idle?: string }) {
  const [modelError, setModelError] = useState<string | null>(null);

  const handleModelError = (error: any) => {
    console.error('Failed to load 3D model:', error);
    setModelError('Gagal memuat model 3D');
  };

  const errorFallback = (
    <Html center>
      <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        Gagal memuat model 3D
      </div>
    </Html>
  );

  if (modelError) {
    return errorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback} onError={handleModelError}>
      <Suspense fallback={<EmptyHtmlLoader />}>
        <RobotModel idle={idle} onModelError={handleModelError} />
      </Suspense>
    </ErrorBoundary>
  );
}

/* ----------------------------- Placeholder for Suspense Fallback ----------------------------- */
function EmptyHtmlLoader() {
  return null;
}

/* ----------------------------- ENHANCED CANVAS ----------------------------- */
function ProgressTracker({
  setLoadingProgress,
  loadingProgress,
}: {
  setLoadingProgress: React.Dispatch<React.SetStateAction<LoadingProgress>>;
  loadingProgress: LoadingProgress;
}) {
  const { progress: threeProgress } = useProgress();

  useEffect(() => {
    if (loadingProgress.phase === 'loading-3d') {
      const interval = setInterval(() => {
        const newProgress = Math.round(threeProgress);
        setLoadingProgress((prev) => ({
          ...prev,
          progress: newProgress,
        }));
        if (newProgress >= 100) {
          clearInterval(interval);
          setLoadingProgress({
            progress: 100,
            phase: 'loading-data',
            message: 'Memuat data cuaca...',
          });
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loadingProgress.phase, setLoadingProgress, threeProgress]);

  return null; // This component doesn't render anything visible
}

function CanvasContent({
  setLoadingProgress,
  loadingProgress,
}: {
  setLoadingProgress: React.Dispatch<React.SetStateAction<LoadingProgress>>;
  loadingProgress: LoadingProgress;
}) {
  const deviceCapabilities = useMemo(() => {
    if (typeof window === 'undefined')
      return { supported: true, quality: 'high' };

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return { supported: false, quality: 'none' };
    }

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;

    let quality = 'medium';
    if (memory >= 8 && cores >= 8) quality = 'high';
    if (renderer.includes('Intel') && !renderer.includes('Iris'))
      quality = 'low';

    return { supported: true, quality, renderer, vendor };
  }, []);

  const dpr = (deviceCapabilities.quality === 'high' ? [1, 2] : [1, 1.5]) as [
    number,
    number,
  ];
  const shadows = deviceCapabilities.quality !== 'low';

  return (
    <>
      <Suspense fallback={<EmptyHtmlLoader />}>
        <Environment preset="city" environmentIntensity={0.3} />

        <directionalLight
          position={[5, 15, 5]}
          intensity={0.8}
          castShadow={shadows}
          shadow-mapSize={
            deviceCapabilities.quality === 'high' ? [2048, 2048] : [1024, 1024]
          }
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          color={0xc0d0e0}
        />

        <ambientLight intensity={0.4} />

        <hemisphereLight
          intensity={0.5}
          groundColor="#0a0a1a"
          color="#2a3040"
        />

        <pointLight
          position={[-3, 4, 2]}
          intensity={0.3}
          color="#0ea5e9"
          distance={15}
        />
        <pointLight
          position={[3, 2, -2]}
          intensity={0.2}
          color="#10b981"
          distance={10}
        />

        <PresentationControls
          global
          enabled={deviceCapabilities.quality !== 'low'}
          polar={[THREE.MathUtils.degToRad(-5), THREE.MathUtils.degToRad(15)]}
          azimuth={[
            THREE.MathUtils.degToRad(-15),
            THREE.MathUtils.degToRad(15),
          ]}
          config={{ mass: 1, tension: 200, friction: 30 }}
          snap={{ mass: 1, tension: 180, friction: 25 }}
        >
          <Bounds fit observe clip margin={1.1}>
            <Robot />
          </Bounds>

          {shadows && (
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.4}
              scale={12}
              blur={2.8}
              far={4}
              frames={deviceCapabilities.quality === 'high' ? 60 : 1}
              color="#0f172a"
            />
          )}
        </PresentationControls>

        {deviceCapabilities.quality !== 'low' && (
          <RainParticles
            count={deviceCapabilities.quality === 'high' ? 1500 : 800}
          />
        )}

        <mesh position={[0, 0, -15]} receiveShadow>
          <planeGeometry args={[50, 30]} />
          <meshStandardMaterial color="#0f172a" transparent opacity={0.3} />
        </mesh>
      </Suspense>
    </>
  );
}

function Enhanced3DCanvas({
  loadingProgress,
  setLoadingProgress,
}: {
  loadingProgress: LoadingProgress;
  setLoadingProgress: React.Dispatch<React.SetStateAction<LoadingProgress>>;
}) {
  const [is3DSupported, setIs3DSupported] = useState(true);

  const deviceCapabilities = useMemo(() => {
    if (typeof window === 'undefined')
      return { supported: true, quality: 'high' };

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      setIs3DSupported(false);
      return { supported: false, quality: 'none' };
    }

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;

    let quality = 'medium';
    if (memory >= 8 && cores >= 8) quality = 'high';
    if (renderer.includes('Intel') && !renderer.includes('Iris'))
      quality = 'low';

    return { supported: true, quality, renderer, vendor };
  }, []);

  if (!is3DSupported) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <div className="text-sm text-white/70">
            Perangkat tidak mendukung rendering 3D
          </div>
          <div className="text-xs text-white/50">
            Menggunakan tampilan minimal
          </div>
        </div>
      </div>
    );
  }

  const dpr = (deviceCapabilities.quality === 'high' ? [1, 2] : [1, 1.5]) as [
    number,
    number,
  ];
  const shadows = deviceCapabilities.quality !== 'low';

  return (
    <Canvas
      shadows={shadows}
      dpr={dpr}
      camera={{
        position: [0, 1.5, 6],
        fov: deviceCapabilities.quality === 'low' ? 45 : 35,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: deviceCapabilities.quality !== 'low',
        alpha: true,
        powerPreference:
          deviceCapabilities.quality === 'high'
            ? 'high-performance'
            : 'default',
        preserveDrawingBuffer: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      onCreated={({ gl, scene, camera }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.fog = new THREE.Fog(0x04080e, 8, 30);
        if (deviceCapabilities.quality === 'low') {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <CanvasContent
        setLoadingProgress={setLoadingProgress}
        loadingProgress={loadingProgress}
      />
    </Canvas>
  );
}

/* ----------------------------- ENHANCED PROGRESS COMPONENT ----------------------------- */
function LoadingProgress({ progress }: { progress: LoadingProgress }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPhaseIcon = () => {
    switch (progress.phase) {
      case 'initializing':
        return <LoaderIcon className="w-5 h-5 animate-spin" />;
      case 'loading-3d':
        return <Droplets className="w-5 h-5 animate-pulse text-blue-300" />; // Animasi dan warna baru
      case 'loading-data':
        return <Cloud className="w-5 h-5 animate-bounce text-sky-400" />; // Warna baru
      case 'connecting':
        return isOnline ? (
          <Wifi className="w-5 h-5 text-emerald-400" />
        ) : (
          <WifiOff className="w-5 h-5 text-orange-400" />
        );
      case 'ready':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <LoaderIcon className="w-5 h-5 animate-spin" />;
    }
  };

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'initializing':
      case 'loading-3d':
        return 'from-blue-400 to-cyan-500';
      case 'loading-data':
        return 'from-blue-400 to-cyan-500';
      case 'connecting':
        return isOnline
          ? 'from-emerald-400 to-green-500'
          : 'from-yellow-400 to-orange-500';
      case 'ready':
        return 'from-emerald-400 to-green-500';
      default:
        return 'from-blue-400 to-cyan-500';
    }
  };

  const displayMessage = useMemo(() => {
    switch (progress.phase) {
      case 'initializing':
        return 'Mempersiapkan inti aplikasi...';
      case 'loading-3d':
        return 'Memuat elemen visual 3D...'; // Pesan lebih spesifik
      case 'loading-data':
        return 'Mengambil data terkini...'; // Pesan lebih umum
      case 'connecting':
        return isOnline
          ? 'Menghubungkan ke server...'
          : 'Mencoba menghubungkan kembali...';
      case 'ready':
        return 'Siap digunakan!';
      default:
        return 'Memulai...';
    }
  }, [progress.phase, isOnline]); // Tambah isOnline sebagai dependency

  return (
    <motion.div
      className="flex items-center gap-3 px-6 py-3 bg-slate-900/60 backdrop-blur-sm rounded-full border border-slate-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="text-blue-400"
        key={progress.phase} // Key untuk re-render dan animasi ikon
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {getPhaseIcon()}
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/90 font-medium mb-1">
          {displayMessage}
        </div>
        <div className="w-40 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getPhaseColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      <motion.div
        className="text-xs text-slate-400 tabular-nums min-w-[3ch]"
        key={Math.round(progress.progress)} // Key untuk animasi persentase
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Math.round(progress.progress)}%
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------- CONTOH FUNGSI TASKS REAL ----------------------------- */
// Fungsi contoh untuk initializing (misal load local storage atau auth)
async function initApp(): Promise<void> {
  // Contoh: Simulasi atau real init
  return new Promise((resolve) => setTimeout(resolve, 1000)); // Ganti dengan real code
}

// Fungsi contoh untuk fetch data (misal API cuaca)
async function fetchWeatherData(): Promise<void> {
  // Contoh real fetch
  try {
    const response = await fetch(
      'https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=Indonesia',
    );
    if (!response.ok) throw new Error('Failed to fetch');
    await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Fungsi contoh untuk check connection
async function checkConnection(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) resolve();
    else setTimeout(() => checkConnection(), 1000); // Retry jika offline
  });
}

/* ----------------------------- MAIN SPLASH SCREEN COMPONENT ----------------------------- */
export function SplashScreen({ isFadingOut, onComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    progress: 0,
    phase: 'initializing',
    message: 'Mempersiapkan aplikasi...',
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const minDuration = 5000; // Durasi total 5 detik
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / minDuration) * 100, 100);

      // Update state progress dan juga pesan fase secara dinamis
      setLoadingProgress({
        progress: progress,
        phase: progress < 30 ? 'initializing' : progress < 70 ? 'loading-3d' : progress < 95 ? 'loading-data' : 'ready',
        message: progress < 30 ? 'Mempersiapkan inti aplikasi...' : progress < 70 ? 'Memuat elemen visual 3D...' : progress < 95 ? 'Mengambil data terkini...' : 'Siap digunakan!',
      });

      if (progress >= 100) {
        clearInterval(interval);
        // Beri jeda singkat untuk memastikan render 100% selesai sebelum onComplete dipanggil
        setTimeout(() => {
          onComplete?.();
        }, 100);
      }
    }, 50); // Update setiap 50ms untuk animasi yang mulus

    return () => {
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-gray-900 to-blue-950 text-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            transition: {
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-transparent to-indigo-800/20"
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(26, 46, 76, 0.2) 0%, transparent 50%, rgba(49, 46, 129, 0.2) 100%)',
                  'linear-gradient(225deg, rgba(49, 46, 129, 0.2) 0%, transparent 50%, rgba(26, 46, 76, 0.2) 100%)',
                  'linear-gradient(135deg, rgba(26, 46, 76, 0.2) 0%, transparent 50%, rgba(49, 46, 129, 0.2) 100%)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="absolute inset-0 bg-[radial-gradient(1400px_800px_at_50%_-10%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(600px_600px_at_50%_100%,rgba(37,99,235,0.04),transparent)] pointer-events-none" />
          </div>

          <motion.div
            className="absolute inset-0 z-0"
            variants={{
              hidden: { scale: 0.8, opacity: 0, y: 20 },
              visible: { scale: 1, opacity: 1, y: 0 },
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              duration: 0.8,
            }}
          >
            <Enhanced3DCanvas
              loadingProgress={loadingProgress}
              setLoadingProgress={setLoadingProgress}
            />
          </motion.div>

          <motion.div
            className="relative z-10 flex w-full h-full flex-col items-center justify-between py-12 px-6 text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div
              className="space-y-2 mt-8"
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <motion.h1
                className="flex justify-center text-6xl sm-text-7xl lg:text-8xl font-bold tracking-tight"
                aria-label="Floodzie"
              >
                {'Flood'.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    className="inline-block text-white"
                    variants={{
                      hidden: { y: 50, opacity: 0, rotateX: -90 },
                      visible: { y: 0, opacity: 1, rotateX: 0 },
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: index * 0.05,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  className="inline-block bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-400 bg-clip-text text-transparent"
                  variants={{
                    hidden: { y: 50, opacity: 0, rotateX: -90 },
                    visible: { y: 0, opacity: 1, rotateX: 0 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: 0.3,
                  }}
                >
                  zie
                </motion.span>
              </motion.h1>

              <motion.div
                className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full mx-auto"
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </motion.div>

            <motion.div
              className="space-y-3 max-w-2xl flex-grow flex flex-col justify-center"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xl sm-text-2xl text-white/90 font-medium">
                Sistem Peringatan Dini Banjir
              </p>
              <p className="text-lg text-white/70">
                Berbasis Komunitas untuk Indonesia
              </p>

              <motion.div
                className="flex items-center justify-center gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Terhubung</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400">Mode Offline</span>
                  </>
                )}
              </motion.div>
            </motion.div>

            <motion.div className="flex flex-col items-center gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <LoadingProgress progress={loadingProgress} />
              </motion.div>

              <motion.div
                className="flex justify-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.2 }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

useGLTF.preload(MODEL_URL);
