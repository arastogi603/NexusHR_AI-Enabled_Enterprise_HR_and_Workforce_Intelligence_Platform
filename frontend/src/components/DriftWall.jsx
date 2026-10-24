'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './DriftWall.css';

const DEFAULT_ITEMS = [
  { id: 1, gradient: 'from-[#0d121f] via-[#141b2c] to-[#1c1825]', glow: 'rgba(255, 107, 44, 0.24)', accent: '#ff6b2c', styleType: 'orbital' },
  { id: 2, gradient: 'from-[#0b0f1a] via-[#121828] to-[#161726]', glow: 'rgba(245, 158, 11, 0.20)', accent: '#f59e0b', styleType: 'horizon' },
  { id: 3, gradient: 'from-[#14121b] via-[#1c1622] to-[#111624]', glow: 'rgba(234, 88, 12, 0.22)', accent: '#ea580c', styleType: 'wave' },
  { id: 4, gradient: 'from-[#0c101d] via-[#131929] to-[#0f1423]', glow: 'rgba(251, 191, 36, 0.16)', accent: '#fbbf24', styleType: 'pill' },
  { id: 5, gradient: 'from-[#121420] via-[#191a2a] to-[#141826]', glow: 'rgba(255, 107, 44, 0.20)', accent: '#ff6b2c', styleType: 'mesh' },
  { id: 6, gradient: 'from-[#0b0e1b] via-[#131a2c] to-[#191b29]', glow: 'rgba(217, 119, 6, 0.20)', accent: '#d97706', styleType: 'orbital' },
  { id: 7, gradient: 'from-[#131522] via-[#181c2e] to-[#101320]', glow: 'rgba(255, 107, 44, 0.18)', accent: '#ff7a3d', styleType: 'horizon' },
  { id: 8, gradient: 'from-[#0d111e] via-[#161828] to-[#131724]', glow: 'rgba(180, 83, 9, 0.22)', accent: '#b45309', styleType: 'wave' },
  { id: 9, gradient: 'from-[#111423] via-[#191c2c] to-[#151424]', glow: 'rgba(245, 158, 11, 0.20)', accent: '#f59e0b', styleType: 'pill' },
  { id: 10, gradient: 'from-[#151320] via-[#1c1827] to-[#101422]', glow: 'rgba(255, 107, 44, 0.24)', accent: '#ff6b2c', styleType: 'mesh' },
  { id: 11, gradient: 'from-[#0a0e1c] via-[#12192c] to-[#151d32]', glow: 'rgba(251, 191, 36, 0.16)', accent: '#fbbf24', styleType: 'orbital' },
  { id: 12, gradient: 'from-[#161219] via-[#1e1722] to-[#111523]', glow: 'rgba(234, 88, 12, 0.20)', accent: '#ea580c', styleType: 'horizon' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const columnFactor = (index, variance) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

const DriftWall = ({
  items = DEFAULT_ITEMS,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
  style
}) => {
  const containerRef = useRef(null);
  const planeRef = useRef(null);
  const trackRefs = useRef([]);
  const rafRef = useRef(null);

  const offsetsRef = useRef([]);
  const velocitiesRef = useRef([]);
  const hoveredColRef = useRef(-1);
  const wallHoveredRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef(null);

  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState(null);
  const activeIdRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = e => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const columnItems = useMemo(() => {
    const cols = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map(col => (col.length ? col : items.slice(0, 1)));
  }, [items, columns]);

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });
  }, [columnItems, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => (meta.copyHeight || 300) * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const applyPlaneTransform = useCallback(
    (px, py) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth]
  );

  useEffect(() => {
    const animate = ts => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const maxTilt = parallax * 8;
      const targetX = (pointerRef.current?.x || 0) * maxTilt;
      const targetY = -(pointerRef.current?.y || 0) * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDampedRef.current.x = (pointerDampedRef.current.x || 0) + (targetX - (pointerDampedRef.current.x || 0)) * damp;
      pointerDampedRef.current.y = (pointerDampedRef.current.y || 0) + (targetY - (pointerDampedRef.current.y || 0)) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      if (!reduced) {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const meta = columnMeta[c];
          if (!meta) continue;
          const paused = wallHoveredRef.current && pauseOnHover;
          const factor = paused || hoveredColRef.current === c ? 0 : 1;
          const target = (baseVelocities[c] ?? 25) * factor;

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          const currentVel = velocitiesRef.current[c] ?? 0;
          const newVel = currentVel + (target - currentVel) * ease;
          velocitiesRef.current[c] = newVel;

          const currentOffset = offsetsRef.current[c] ?? 0;
          let next = currentOffset + newVel * dt;
          if (meta.copyHeight > 0) {
            next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          }
          offsetsRef.current[c] = next;

          const el = trackRefs.current[c];
          if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      } else {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const el = trackRefs.current[c];
          const meta = columnMeta[c];
          if (el && meta) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform]);

  const activate = useCallback((id, index) => {
    activeIdRef.current = id;
    hoveredColRef.current = index;
    setActiveId(id);
  }, []);
  const release = useCallback(() => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    e => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5
        };
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit && hit.closest ? hit.closest('[data-tile-id]') : null;
      if (!tile) return;
      const id = tile.dataset.tileId;
      if (id === activeIdRef.current) return;
      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced]
  );

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const cssVars = useMemo(
    () => ({
      '--dw-tile-w': `${tileWidth}px`,
      '--dw-tile-h': `${tileHeight}px`,
      '--dw-gap': `${gap}px`,
      '--dw-radius': `${radius}px`,
      '--dw-perspective': `${perspective}px`,
      '--dw-lift': `${lift}px`,
      '--dw-dim': dim,
      '--dw-gray': grayscale ? 1 : 0,
      '--dw-overlay': overlayColor,
      '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
      ...style
    }),
    [tileWidth, tileHeight, gap, radius, perspective, lift, dim, grayscale, overlayColor, fade, style]
  );

  const renderTile = (item, id, colIndex) => {
    const inner = (
      <span className="drift-wall__inner">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />
        ) : (
          <div className={`w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br ${item.gradient || 'from-[#0d121f] via-[#141b2c] to-[#1c1825]'} text-white relative overflow-hidden select-none rounded-[16px]`}>
            {/* Ambient corner radial glow adhering to brand ember/amber palette */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{ background: item.glow || 'rgba(255, 107, 44, 0.22)' }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-xl pointer-events-none opacity-40"
              style={{ background: item.glow || 'rgba(255, 107, 44, 0.22)' }}
            />

            {/* Top header bar: sleek geometric indicators (NO TEXT) */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,107,44,0.6)]"
                  style={{ backgroundColor: item.accent || '#ff6b2c' }}
                />
                <span className="w-7 h-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/[0.06]" />
              </div>
              <span className="w-2 h-2 rounded-full border border-white/20" />
            </div>

            {/* Center abstract geometric motif (NO TEXT) */}
            <div className="my-auto z-10 w-full flex items-center justify-center opacity-70">
              {item.styleType === 'orbital' && (
                <svg viewBox="0 0 100 40" className="w-24 h-8 overflow-visible">
                  <ellipse cx="50" cy="20" rx="42" ry="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <ellipse cx="50" cy="20" rx="28" ry="9" fill="none" stroke={item.accent || '#ff6b2c'} strokeWidth="1.2" strokeDasharray="14 6" opacity="0.8" />
                  <circle cx="65" cy="14" r="2.5" fill={item.accent || '#ff6b2c'} className="drop-shadow-[0_0_6px_rgba(255,107,44,0.8)]" />
                </svg>
              )}
              {item.styleType === 'horizon' && (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <div
                    className="h-[1.5px] w-4/5 rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${item.accent || '#ff6b2c'} 50%, transparent 100%)` }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="w-10 h-[1px] bg-white/10" />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.accent || '#ff6b2c' }} />
                  </div>
                </div>
              )}
              {item.styleType === 'wave' && (
                <svg viewBox="0 0 100 30" className="w-24 h-7 overflow-visible">
                  <path
                    d="M 5 22 Q 25 5, 50 15 T 95 8"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 5 18 Q 28 25, 55 12 T 95 18"
                    fill="none"
                    stroke={item.accent || '#ff6b2c'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              )}
              {item.styleType === 'pill' && (
                <div className="flex flex-col gap-1.5 w-3/4">
                  <div className="h-1.5 rounded-full bg-white/[0.08] w-full" />
                  <div
                    className="h-1.5 rounded-full w-2/3"
                    style={{ background: `linear-gradient(90deg, ${item.accent || '#ff6b2c'}, transparent)` }}
                  />
                  <div className="h-1.5 rounded-full bg-white/[0.05] w-1/2" />
                </div>
              )}
              {item.styleType === 'mesh' && (
                <div className="grid grid-cols-4 gap-2 opacity-50">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: i === 2 || i === 5 ? (item.accent || '#ff6b2c') : 'rgba(255,255,255,0.15)'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom minimal baseline lines (NO TEXT) */}
            <div className="flex items-center justify-between z-10 pt-1.5 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="w-8 h-1 rounded-full bg-white/10" />
                <span className="w-3 h-1 rounded-full bg-white/10" />
              </div>
              <span className="w-5 h-1 rounded-full" style={{ backgroundColor: item.accent ? `${item.accent}66` : 'rgba(255,107,44,0.4)' }} />
            </div>
          </div>
        )}
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    );
    const commonProps = {
      className: `drift-wall__tile${activeId === id ? ' is-active' : ''}`,
      'data-tile-id': id,
      'data-col': colIndex,
      onFocus: () => activate(id, colIndex),
      onBlur: release
    };
    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }
    return (
      <div key={id} tabIndex={0} role="button" aria-label="Decorative ambient card" {...commonProps}>
        {inner}
      </div>
    );
  };

  const rootClass = ['drift-wall', reduced ? 'drift-wall--reduced' : '', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-label="Drifting wall of tiles"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((col, c) => {
          const meta = columnMeta[c];
          const copies = Array.from({ length: meta.copies });
          return (
            <div className="drift-wall__col" key={`col-${c}`}>
              <div className="drift-wall__track" ref={el => (trackRefs.current[c] = el)}>
                {copies.map((_, copyIndex) =>
                  col.map((item, itemIndex) => renderTile(item, `${c}-${copyIndex}-${itemIndex}`, c))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
