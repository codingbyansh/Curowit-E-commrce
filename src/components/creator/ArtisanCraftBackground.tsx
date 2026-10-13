import React, { useEffect, useRef, useState } from 'react';

interface ArtisanCraftBackgroundProps {
  className?: string;
  theme?: 'warm-paper' | 'canvas-cream' | 'raw-linen';
  interactive?: boolean;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  children?: React.ReactNode;
}

export const ArtisanCraftBackground: React.FC<ArtisanCraftBackgroundProps> = ({
  className = '',
  theme = 'warm-paper',
  interactive = true,
  intensity = 'medium',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Background base colors according to artisan theme
  const bgClass =
    theme === 'canvas-cream'
      ? 'bg-[#FFFDF7]'
      : theme === 'raw-linen'
      ? 'bg-[#F2E5D3]'
      : 'bg-[#F7EBD7]';

  // Interactive HTML5 Canvas: Artisan Weave & Constellation Drafting Lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Node & thread simulation
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      type: 'dot' | 'cross' | 'stitch';
    }> = [];

    const types: Array<'dot' | 'cross' | 'stitch'> = ['dot', 'cross', 'stitch'];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.15,
        type: types[i % 3],
      });
    }

    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let currentMouseX = -1000;
    let currentMouseY = -1000;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? -1000 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? -1000 : e.clientY;
      targetMouseX = clientX - rect.left;
      targetMouseY = clientY - rect.top;
      setMousePos({ x: targetMouseX, y: targetMouseY });
    };

    const handlePointerLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handlePointerMove);
      parent.addEventListener('mouseleave', handlePointerLeave);
      parent.addEventListener('touchmove', handlePointerMove, { passive: true });
      parent.addEventListener('touchend', handlePointerLeave);
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      // Update and draw particles
      const darkColor = '#173B3D'; // Brand deep artisan slate/teal

      // Draw subtle connecting artisan weave threads between nearby nodes
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap boundaries
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Connect with other particles within artisan drafting threshold
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const threadAlpha = (1 - dist / 115) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(23, 59, 61, ${threadAlpha})`;
            ctx.lineWidth = 0.85;
            // Dotted or dashed drafting thread
            ctx.setLineDash([3, 4]);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Connect with interactive pointer if nearby
        if (interactiveMode && currentMouseX > 0 && currentMouseY > 0) {
          const mdx = p1.x - currentMouseX;
          const mdy = p1.y - currentMouseY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < 160) {
            const mouseThreadAlpha = (1 - mDist / 160) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(23, 59, 61, ${mouseThreadAlpha})`;
            ctx.lineWidth = 1.1;
            ctx.setLineDash([2, 3]);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(currentMouseX, currentMouseY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw a subtle magnetic circle around point
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(242, 169, 0, ${mouseThreadAlpha * 0.8})`;
            ctx.stroke();
          }
        }

        // Draw artisan glyph node: dot, cross-stitch, or stitch tick
        ctx.fillStyle = `rgba(23, 59, 61, ${p1.baseAlpha})`;
        ctx.strokeStyle = `rgba(23, 59, 61, ${p1.baseAlpha * 1.2})`;
        ctx.lineWidth = 1;

        if (p1.type === 'cross') {
          const size = 3;
          ctx.beginPath();
          ctx.moveTo(p1.x - size, p1.y);
          ctx.lineTo(p1.x + size, p1.y);
          ctx.moveTo(p1.x, p1.y - size);
          ctx.lineTo(p1.x, p1.y + size);
          ctx.stroke();
        } else if (p1.type === 'stitch') {
          const size = 3.5;
          ctx.beginPath();
          ctx.moveTo(p1.x - size, p1.y - size);
          ctx.lineTo(p1.x + size, p1.y + size);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handlePointerMove);
        parent.removeEventListener('mouseleave', handlePointerLeave);
        parent.removeEventListener('touchmove', handlePointerMove);
        parent.removeEventListener('touchend', handlePointerLeave);
      }
    };
  }, [interactiveMode]);

  return (
    <div ref={containerRef} className={`relative isolate overflow-hidden ${bgClass} ${className}`}>
      {/* =========================================================================
          LAYER 1: CSS DOTTED MATRIX CRAFT GRID (FINE ARTISAN RESOLUTION)
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-45 mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(23, 59, 61, 0.22) 1.25px, transparent 1.25px),
            radial-gradient(circle, rgba(23, 59, 61, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 72px 72px',
          backgroundPosition: '0 0, 12px 12px',
        }}
        aria-hidden="true"
      />

      {/* =========================================================================
          LAYER 2: CRAFT DIAGONAL HATCH & BLUEPRINT RULES
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(23, 59, 61, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(23, 59, 61, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
        aria-hidden="true"
      />

      {/* =========================================================================
          LAYER 3: ARTISANAL SVG DRAFTING MARKS, DARK LINES & DOTTED VECTORS
          ========================================================================= */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-40 select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="ruler-ticks" width="100" height="24" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#173B3D" strokeWidth="1.2" strokeOpacity="0.4" />
            <line x1="20" y1="0" x2="20" y2="6" stroke="#173B3D" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="40" y1="0" x2="40" y2="6" stroke="#173B3D" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="60" y1="0" x2="60" y2="6" stroke="#173B3D" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="80" y1="0" x2="80" y2="6" stroke="#173B3D" strokeWidth="0.8" strokeOpacity="0.25" />
            <text x="4" y="20" fill="#173B3D" fillOpacity="0.3" fontSize="8" fontFamily="monospace">
              +10cm
            </text>
          </pattern>

          {/* Dotted seam pattern */}
          <pattern id="cross-stitch" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 22 24 L 26 24 M 24 22 L 24 26"
              stroke="#173B3D"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>

        {/* Top & Left Metric Ruler Lines */}
        <rect x="0" y="0" width="100%" height="24" fill="url(#ruler-ticks)" />
        <line x1="0" y1="24" x2="100%" y2="24" stroke="#173B3D" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.35" />

        {/* Top Left Craft Compass Curve */}
        <circle cx="160" cy="180" r="120" fill="none" stroke="#173B3D" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.25" />
        <circle cx="160" cy="180" r="140" fill="none" stroke="#173B3D" strokeWidth="0.8" strokeDasharray="8 6" strokeOpacity="0.2" />
        <circle cx="160" cy="180" r="4" fill="#173B3D" fillOpacity="0.3" />
        <line x1="160" y1="40" x2="160" y2="320" stroke="#173B3D" strokeWidth="0.75" strokeDasharray="2 4" strokeOpacity="0.2" />
        <line x1="20" y1="180" x2="300" y2="180" stroke="#173B3D" strokeWidth="0.75" strokeDasharray="2 4" strokeOpacity="0.2" />
        <text x="175" y="195" fill="#173B3D" fillOpacity="0.3" fontSize="9" fontFamily="monospace" letterSpacing="1">
          CALIPER RADIUS: 140mm [AXIS-A]
        </text>

        {/* Diagonal Artisan Vector Lines with Measurement Notes */}
        <line x1="0" y1="420" x2="100%" y2="580" stroke="#173B3D" strokeWidth="1" strokeDasharray="6 8" strokeOpacity="0.25" />
        <line x1="0" y1="428" x2="100%" y2="588" stroke="#173B3D" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Top Right Studio Drafting Geometry */}
        <g className="hidden md:block">
          <circle cx="88%" cy="140" r="85" fill="none" stroke="#173B3D" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.25" />
          <circle cx="88%" cy="140" r="50" fill="none" stroke="#173B3D" strokeWidth="0.75" strokeDasharray="1 3" strokeOpacity="0.2" />
          <path d="M calc(88% - 100px) 140 L calc(88% + 100px) 140" stroke="#173B3D" strokeWidth="0.75" strokeDasharray="4 6" strokeOpacity="0.25" />
          <text x="calc(88% - 60px)" y="155" fill="#173B3D" fillOpacity="0.35" fontSize="8" fontFamily="monospace">
            Ø 170 · WEFT TENSION 100%
          </text>
        </g>

        {/* Mid-Page Artisanal Curved Contour Line (Ceramic / Potter's Profile) */}
        <path
          d="M 50 780 C 220 720, 360 890, 580 820 S 920 680, 1200 790"
          fill="none"
          stroke="#173B3D"
          strokeWidth="1.2"
          strokeDasharray="5 7"
          strokeOpacity="0.28"
        />

        {/* Bottom Left Handcrafted Spec Anchor */}
        <g transform="translate(40, 920)">
          <line x1="0" y1="0" x2="120" y2="0" stroke="#173B3D" strokeWidth="1" strokeOpacity="0.35" />
          <line x1="0" y1="0" x2="0" y2="40" stroke="#173B3D" strokeWidth="1" strokeOpacity="0.35" />
          <text x="6" y="16" fill="#173B3D" fillOpacity="0.38" fontSize="8" fontFamily="monospace">
            CUROWIT CRAFT MATRIX
          </text>
          <text x="6" y="28" fill="#173B3D" fillOpacity="0.28" fontSize="8" fontFamily="monospace">
            GRID 24pt · SLOW-CRAFT DRAFT
          </text>
        </g>
      </svg>

      {/* =========================================================================
          LAYER 4: INTERACTIVE CANVAS PARTICLES & DRAFTING THREADS
          ========================================================================= */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-75"
        aria-hidden="true"
      />

      {/* =========================================================================
          LAYER 5: FLOATING CRAFT BADGE (INTERACTIVE STATUS INDICATOR)
          ========================================================================= */}
      <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFF8EA]/80 backdrop-blur-md border border-[#173B3D]/15 text-[10px] text-[#173B3D]/75 font-mono shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3F704B] animate-pulse" />
        <span>Craft Drafting Matrix · 1:1 Scale</span>
        <button
          onClick={() => setInteractiveMode((prev) => !prev)}
          className="text-[#07545A] font-bold hover:underline cursor-pointer pl-1 border-l border-[#173B3D]/15"
          title="Toggle interactive constellation threads"
        >
          {interactiveMode ? 'Dynamic' : 'Static'}
        </button>
      </div>

      {/* =========================================================================
          CONTENT SLOTS
          ========================================================================= */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
