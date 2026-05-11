import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import confetti from 'canvas-confetti';

// --- Game Engine Types ---
type BodyType = 'GAS_GIANT' | 'MOON' | 'ASTEROID' | 'STAR';

interface CelestialBody {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: BodyType;
  color: string;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  pulseOffset: number;
}

interface EnergyArc {
  from: CelestialBody;
  to: CelestialBody;
  sparks: Spark[];
  intensity: number;
}

interface Spark {
  progress: number;
  speed: number;
  color: string;
}

const COLORS = {
  GAS_GIANT: '#8a2be2',
  MOON: '#00ffff',
  ASTEROID: '#ffd700',
  STAR: '#ffffff',
};

export const CosmicForge: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { setScore, score, setScreen } = useGameStore();

  const bodiesRef = useRef<CelestialBody[]>([]);
  const arcsRef = useRef<EnergyArc[]>([]);
  const draggingRef = useRef<{ active: boolean, from: CelestialBody | null, currentX: number, currentY: number }>({ active: false, from: null, currentX: 0, currentY: 0 });
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  // Background Starfield
  const starsRef = useRef<{x: number, y: number, r: number, a: number, aSpeed: number}[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Better perf without alpha backing
    if (!ctx) return;

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    // Generate Background Stars
    starsRef.current = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * Math.PI * 2,
      aSpeed: Math.random() * 0.05 + 0.01
    }));

    const generateBodies = () => {
      const b: CelestialBody[] = [];
      b.push({ id: 'star_0', x: cx, y: cy, radius: 45, type: 'STAR', color: COLORS.STAR, orbitAngle: 0, orbitRadius: 0, orbitSpeed: 0, pulseOffset: 0 });
      
      const numBodies = 8;
      for (let i = 0; i < numBodies; i++) {
        const typeRand = Math.random();
        let type: BodyType = 'ASTEROID';
        let radius = 12;
        let speedMult = 1.0;
        
        if (typeRand > 0.7) { type = 'GAS_GIANT'; radius = 28; speedMult = 0.3; }
        else if (typeRand > 0.3) { type = 'MOON'; radius = 18; speedMult = 0.8; }
        
        b.push({
          id: `body_${i}`,
          x: 0, y: 0,
          radius,
          type,
          color: COLORS[type],
          orbitAngle: Math.random() * Math.PI * 2,
          orbitRadius: 100 + (i * ((Math.min(cx, cy) - 120) / numBodies)),
          orbitSpeed: (0.0004 + Math.random() * 0.0006) * (i % 2 === 0 ? 1 : -1) * speedMult,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
      return b;
    };

    if (bodiesRef.current.length === 0) {
       bodiesRef.current = generateBodies();
       arcsRef.current = [];
    }
    
    gameOverRef.current = false;
    let animationId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      // Draw Background
      ctx.fillStyle = '#05020a'; 
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw & Update stars
      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach(star => {
        star.a += star.aSpeed;
        const opacity = Math.abs(Math.sin(star.a)) * 0.8 + 0.2;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Update Planet Positions
      bodiesRef.current.forEach(b => {
        if (b.type !== 'STAR') {
          b.orbitAngle += b.orbitSpeed * dt;
          b.x = cx + Math.cos(b.orbitAngle) * b.orbitRadius;
          b.y = cy + Math.sin(b.orbitAngle) * b.orbitRadius;

          // Draw faint orbit paths
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          ctx.arc(cx, cy, b.orbitRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Update Arcs & Sparks
      for (let i = arcsRef.current.length - 1; i >= 0; i--) {
        const arc = arcsRef.current[i];
        const sparkRate = arc.from.type === 'GAS_GIANT' ? 0.04 : 0.02;
        
        if (Math.random() < sparkRate) {
            arc.sparks.push({ 
               progress: 0, 
               speed: 0.001 * dt + (arc.to.type === 'MOON' ? 0.002 : 0),
               color: arc.to.color
            });
        }

        for (let j = arc.sparks.length - 1; j >= 0; j--) {
          const s = arc.sparks[j];
          s.progress += s.speed;
          if (s.progress >= 1) {
            arc.sparks.splice(j, 1);
            
            // Score Update
            let points = arc.to.type === 'GAS_GIANT' ? 10 : (arc.to.type === 'MOON' ? 25 : 50);
            
            // Asteroids give huge points but risk collapsing the chain
            if (arc.to.type === 'ASTEROID') {
               if (Math.random() < 0.08) {
                   gameOverRef.current = true;
                   confetti({ particleCount: 100, spread: 100, origin: { x: arc.to.x/dimensions.width, y: arc.to.y/dimensions.height }, colors: ['#ff0000', '#ffd700']});
               }
               points = 100;
            }
            setScore(scoreRef.current + points);
            
            // Visual pop
            arc.intensity = 1.0;
          }
        }
        arc.intensity = Math.max(0, (arc.intensity || 0) - 0.02);
      }

      // Draw Arcs
      arcsRef.current.forEach(arc => {
        ctx.beginPath();
        const baseWidth = 2;
        ctx.lineWidth = baseWidth + arc.intensity * 3;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + arc.intensity * 0.4})`; 
        ctx.shadowBlur = 10 + arc.intensity * 10;
        ctx.shadowColor = '#00ffff';
        
        ctx.moveTo(arc.from.x, arc.from.y);
        ctx.lineTo(arc.to.x, arc.to.y);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw Sparks
        arc.sparks.forEach(s => {
          const sx = arc.from.x + (arc.to.x - arc.from.x) * s.progress;
          const sy = arc.from.y + (arc.to.y - arc.from.y) * s.progress;
          ctx.beginPath();
          ctx.fillStyle = s.color || '#fff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = s.color || '#fff';
          ctx.arc(sx, sy, 3 + (arc.to.type === 'GAS_GIANT' ? 1 : 0), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // Draw Drag Line
      if (draggingRef.current.active && draggingRef.current.from) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(draggingRef.current.from.x, draggingRef.current.from.y);
        ctx.lineTo(draggingRef.current.currentX, draggingRef.current.currentY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Celestial Bodies
      bodiesRef.current.forEach(b => {
        const pulse = Math.sin(time / 500 + b.pulseOffset) * 0.15 + 0.85; // 0.7 to 1.0
        
        // Atmosphere/Glow
        const gradient = ctx.createRadialGradient(b.x, b.y, b.radius * 0.5, b.x, b.y, b.radius * 2);
        gradient.addColorStop(0, b.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.4 * pulse;
        ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Solid Core
        ctx.beginPath();
        ctx.fillStyle = b.color;
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.arc(b.x - b.radius*0.3, b.y - b.radius*0.3, b.radius*0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameOverRef.current) {
         setTimeout(() => setScreen('GAMEOVER'), 500); // Wait a moment for explosion effect before switching screen
         return; 
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, setScore, setScreen]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const findBodyAt = (x: number, y: number) => {
    for (let i = bodiesRef.current.length - 1; i >= 0; i--) {
      const b = bodiesRef.current[i];
      const dx = b.x - x;
      const dy = b.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= b.radius + 20) {
        return b;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getPointerPos(e);
    const body = findBodyAt(x, y);
    if (body) {
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
      draggingRef.current = { active: true, from: body, currentX: x, currentY: y };
      
      // Select effect
      confetti({
         particleCount: 15,
         spread: 40,
         origin: { x: body.x / dimensions.width, y: body.y / dimensions.height },
         colors: [body.color, '#ffffff'],
         disableForReducedMotion: true,
         zIndex: 0
      });
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingRef.current.active) return;
    const { x, y } = getPointerPos(e);
    draggingRef.current.currentX = x;
    draggingRef.current.currentY = y;
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingRef.current.active || !draggingRef.current.from) return;
    let pos;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      pos = { 
        x: e.changedTouches[0].clientX - (rect?.left || 0), 
        y: e.changedTouches[0].clientY - (rect?.top || 0) 
      };
    } else {
       pos = getPointerPos(e);
    }
    
    const targetBody = findBodyAt(pos.x, pos.y);
    const fromBody = draggingRef.current.from;
    
    if (targetBody && targetBody.id !== fromBody.id) {
       const exists = arcsRef.current.some(a => 
           (a.from.id === fromBody.id && a.to.id === targetBody.id) ||
           (a.to.id === fromBody.id && a.from.id === targetBody.id)
       );
       
       if (!exists && targetBody.type !== 'STAR') {
           arcsRef.current.push({ from: fromBody, to: targetBody, sparks: [], intensity: 1.0 });
           if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
           
           confetti({
             particleCount: 30,
             spread: 60,
             origin: { x: targetBody.x / dimensions.width, y: targetBody.y / dimensions.height },
             colors: [fromBody.color, targetBody.color],
             zIndex: 0
           });
       }
    }
    draggingRef.current = { active: false, from: null, currentX: 0, currentY: 0 };
  };

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => { e.preventDefault(); handlePointerDown(e); }}
        onTouchMove={(e) => { e.preventDefault(); handlePointerMove(e); }}
        onTouchEnd={(e) => { e.preventDefault(); handlePointerUp(e); }}
        onTouchCancel={handlePointerUp}
        className="w-full h-full block touch-none outline-none"
      />
    </div>
  );
};

