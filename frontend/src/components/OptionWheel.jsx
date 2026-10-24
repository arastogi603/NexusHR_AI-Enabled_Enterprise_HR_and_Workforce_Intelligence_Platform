'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import './OptionWheel.css';

const DEFAULT_ITEMS = [
  'Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave',
  'Trance', 'Funk', 'Disco', 'Hip-Hop', 'Chillwave', 'Drum & Bass'
];

/* ── Pure layout function — positions every item along the curve ────── */
function layoutItems(els, n, pos, cfg) {
  if (!n || !els.length) return;
  const mirror = cfg.side === 'right' ? -1 : 1;
  const tiltRad = (cfg.tilt * Math.PI) / 180;
  const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

  for (let i = 0; i < n; i++) {
    const el = els[i];
    if (!el) continue;
    let d = i - pos;
    if (cfg.loop && n > 1) {
      d = ((d % n) + n) % n;
      if (d > n / 2) d -= n;
    }
    const dist = Math.abs(d);
    let x = 0, y = d * cfg.rowH, rot = 0;
    if (R > 0) {
      const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
      y = R * Math.sin(ang);
      x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
      rot = (mirror * ang * 180) / Math.PI;
    }
    el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
    el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
    el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
    el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
  }
}

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = ''
}) => {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);

  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined'
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16;

  const cfg = {
    onChange,
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve, tilt, blur, fade, minOpacity, side, loop,
    smoothing, draggable, soundUrl, soundVolume
  };
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  // ── rAF animation loop ────────────────────────────────────────────────
  const runFrameRef = useRef(null);
  if (!runFrameRef.current) {
    runFrameRef.current = function runFrame(now) {
      const c = cfgRef.current;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const tau = Math.max(c.smoothing, 1) / 1000;
      const k = 1 - Math.exp(-dt / tau);

      const target = targetRef.current;
      const cur = posRef.current;
      let next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.001;
      if (settled) next = target;
      posRef.current = next;

      layoutItems(itemRefs.current, c.count, next, c);
      rafRef.current = settled ? null : requestAnimationFrame(runFrameRef.current);
    };
  }

  function startLoop() {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrameRef.current);
  }

  function playTick() {
    const c = cfgRef.current;
    if (!c.soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== c.soundUrl) {
      audioRef.current = new Audio(c.soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = c.soundUrl;
    }
    const a = audioRef.current;
    a.volume = Math.min(Math.max(c.soundVolume, 0), 1);
    a.currentTime = 0;
    a.play()?.catch(() => {});
  }

  function applyTarget(value, snap) {
    const c = cfgRef.current;
    let v = value;
    if (!c.loop) v = Math.min(Math.max(v, 0), Math.max(c.count - 1, 0));
    if (snap) v = Math.round(v);
    targetRef.current = v;
    const idx = ((Math.round(v) % c.count) + c.count) % c.count;
    if (idx !== selectedRef.current) {
      selectedRef.current = idx;
      setSelectedIndex(idx);
      c.onChange?.(idx, c.items[idx]);
      playTick();
    }
    startLoop();
  }

  // Position items synchronously before every paint
  useLayoutEffect(() => {
    layoutItems(itemRefs.current, cfgRef.current.count, posRef.current, cfgRef.current);
  });

  // Wheel / touchpad scrolling
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const c = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / c.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => {
      el.removeEventListener('wheel', handler);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  });

  // Pointer / drag handlers
  function handlePointerDown(e) {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }
  function handlePointerMove(e) {
    const drag = dragRef.current;
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!dragMovedRef.current && Math.abs(dy) > 4) {
      dragMovedRef.current = true;
      rootRef.current?.setPointerCapture(drag.id);
    }
    if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false);
  }
  function handlePointerEnd() {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }
  function handleItemClick(index) {
    if (dragMovedRef.current) return;
    const c = cfgRef.current;
    const cur = targetRef.current;
    let d = index - (((cur % c.count) + c.count) % c.count);
    if (c.loop && c.count > 1) {
      if (d > c.count / 2) d -= c.count;
      else if (d < -c.count / 2) d += c.count;
    }
    applyTarget(cur + d, true);
  }
  function handleKeyDown(e) {
    let delta = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
    if (delta == null) return;
    e.preventDefault();
    applyTarget(Math.round(targetRef.current) + delta, true);
  }

  // Cleanup
  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    audioRef.current?.pause();
  }, []);

  // Determine if items are objects (with icon/label) or plain strings
  const isObjectItems = items.length > 0 && typeof items[0] === 'object';

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`option-wheel${side === 'right' ? ' option-wheel--right' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const label = isObjectItems ? item.label : item;
        const Icon = isObjectItems ? item.icon : null;
        const isSelected = selectedIndex === index;

        return (
          <div
            key={`${label}-${index}`}
            ref={el => { itemRefs.current[index] = el; }}
            role="option"
            aria-selected={isSelected}
            className={`option-wheel__item${isSelected ? ' option-wheel__item--selected' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            {isObjectItems ? (
              <div className="ow-item-inner">
                {Icon && (
                  <div className="ow-icon-wrap">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                )}
                <div className="ow-label-gooey">
                  <span className="ow-label-text">{label}</span>
                </div>
              </div>
            ) : (
              label
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OptionWheel;
