import { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Html } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ModelViewer.module.css';

// Проверяем, что по URL отдаётся реальная модель (не 404 и не HTML)
async function isModelUrlValid(url) {
  try {
    let res = await fetch(url, { method: 'HEAD' });
    if (res.status === 405) {
      res = await fetch(url);
    }
    if (!res.ok) return false;
    const ct = (res.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('text/html')) return false;
    return true;
  } catch {
    return false;
  }
}

// Компонент для очистки ресурсов при размонтировании
function SceneCleanup() {
  const { gl, scene } = useThree();
  
  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });
      gl.dispose();
    };
  }, [gl, scene]);
  
  return null;
}

// 3D Model Component
function RockModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} scale={[2, 2, 2]} position={[0, 0, 0]} />;
}

// 3D Model from Image
function ImageModel({ imagePath }) {
  const texture = useTexture(imagePath);
  
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);
  
  return (
    <mesh>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial map={texture} transparent={true} side={2} />
    </mesh>
  );
}

// Fallback 3D Model
function FallbackModel({ color = '#ffd700' }) {
  return (
    <mesh>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

const ModelViewer = ({ modelPath, imagePath, fallbackColor = '#ffd700' }) => {
  const controlsRef = useRef();
  const [modelUrlValid, setModelUrlValid] = useState(null);
  
  // Уникальный ключ для пересоздания Canvas при смене путей
  const canvasKey = useMemo(() => `${modelPath || ''}-${imagePath || ''}`, [modelPath, imagePath]);

  useEffect(() => {
    if (!modelPath) {
      setModelUrlValid(null);
      return;
    }
    let cancelled = false;
    setModelUrlValid(null);
    isModelUrlValid(modelPath).then((valid) => {
      if (!cancelled) setModelUrlValid(valid);
    });
    return () => {
      cancelled = true;
    };
  }, [modelPath]);
  
  // Очистка кэша текстур при смене imagePath
  useEffect(() => {
    return () => {
      if (imagePath) {
        useTexture.clear(imagePath);
      }
    };
  }, [imagePath]);
  
  // Очистка кэша моделей при смене modelPath
  useEffect(() => {
    return () => {
      if (modelPath) {
        useGLTF.clear(modelPath);
      }
    };
  }, [modelPath]);

  const handleRotate = (direction) => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const currentAzimuthalAngle = controls.getAzimuthalAngle();
    const currentPolarAngle = controls.getPolarAngle();
    const rotationStep = Math.PI / 8; // 22.5 degrees

    switch (direction) {
      case 'up':
        controls.setPolarAngle(Math.max(0.1, currentPolarAngle - rotationStep));
        break;
      case 'down':
        controls.setPolarAngle(Math.min(Math.PI - 0.1, currentPolarAngle + rotationStep));
        break;
      case 'left':
        controls.setAzimuthalAngle(currentAzimuthalAngle - rotationStep);
        break;
      case 'right':
        controls.setAzimuthalAngle(currentAzimuthalAngle + rotationStep);
        break;
      default:
        break;
    }
  };

  const renderModel = () => {
    if (modelPath) {
      if (modelUrlValid === null) {
        return imagePath ? <ImageModel imagePath={imagePath} /> : <FallbackModel color={fallbackColor} />;
      }
      if (modelUrlValid === false) {
        return imagePath ? <ImageModel imagePath={imagePath} /> : <FallbackModel color={fallbackColor} />;
      }
      return <RockModel modelPath={modelPath} />;
    }
    if (imagePath) return <ImageModel imagePath={imagePath} />;
    return <FallbackModel color={fallbackColor} />;
  };

  return (
    <div className={styles.container}>
      <Canvas 
        key={canvasKey}
        camera={{ position: [0, 0, 5], fov: 50 }} 
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <SceneCleanup />
        <Suspense
          fallback={
            <Html center>
              <div className={styles.loading}>Загрузка 3D модели...</div>
            </Html>
          }
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {renderModel()}

          <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} autoRotate={false} />
        </Suspense>
      </Canvas>

      <div className={styles.controls}>
        <div className={styles.horizontalControls}>
          <button className={styles.controlButton} onClick={() => handleRotate('left')} aria-label='Повернуть влево'>
            <ChevronLeft size={24} />
          </button>
          <button className={styles.controlButton} onClick={() => handleRotate('right')} aria-label='Повернуть вправо'>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
