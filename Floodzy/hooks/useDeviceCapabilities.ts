import { useState, useEffect, useMemo } from 'react';

interface DeviceCapabilities {
  memory: number;
  cores: number;
  gpu: string;
  pixelRatio: number;
  isLowEnd: boolean;
  quality: 'low' | 'medium' | 'high';
  supportsWebGL2: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    memory: 4,
    cores: 4,
    gpu: 'unknown',
    pixelRatio: 1,
    isLowEnd: false,
    quality: 'medium',
    supportsWebGL2: false,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // Memory detection
      const memory = (navigator as any).deviceMemory || 4;

      // CPU cores
      const cores = navigator.hardwareConcurrency || 4;

      // Pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;

      // WebGL support detection
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supportsWebGL2 = !!gl2;

      let gpu = 'unknown';
      if (gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
        }
      }

      // Determine device quality
      let quality: 'low' | 'medium' | 'high' = 'medium';
      const isLowEnd = memory < 4 || cores < 4;

      if (memory >= 8 && cores >= 8 && supportsWebGL2) {
        quality = 'high';
      } else if (isLowEnd || !gl) {
        quality = 'low';
      }

      // Additional checks for integrated graphics
      if (
        gpu.toLowerCase().includes('intel') &&
        !gpu.toLowerCase().includes('iris')
      ) {
        quality = quality === 'high' ? 'medium' : 'low';
      }

      setCapabilities({
        memory,
        cores,
        gpu,
        pixelRatio,
        isLowEnd,
        quality,
        supportsWebGL2,
      });
    };

    detectCapabilities();
  }, []);

  return capabilities;
}
