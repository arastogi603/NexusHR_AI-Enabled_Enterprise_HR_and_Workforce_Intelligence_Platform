"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollImageSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    const container = containerRef.current;
    if (!canvas || !ctx || !container) return;

    // ── High-DPI (Retina) Scaling ──────────────────────────────
    const dpr = window.devicePixelRatio || 1;
    const BASE_W = 1920;
    const BASE_H = 1080;
    canvas.width = BASE_W * dpr;
    canvas.height = BASE_H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.scale(dpr, dpr);

    // ── Offscreen canvas for chroma-key processing ─────────────
    const offCanvas = document.createElement("canvas");
    offCanvas.width = BASE_W;
    offCanvas.height = BASE_H;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true })!;

    const frameCount = 300;
    const currentFrame = (index: number) =>
      `/ezgif-black/ezgif-frame-${(index + 1).toString().padStart(3, "0")}.jpg`;

    const images: HTMLImageElement[] = [];
    const sequence = { frame: 0 };
    let loadedCount = 0;

    // ── Black-background chroma key threshold ──────────────────
    // Any pixel whose R+G+B sum is below this value is treated as
    // "black background" and made fully transparent. Pixels above
    // this threshold are kept at full opacity. Pixels in between
    // get a smooth alpha ramp so edges aren't jaggy.
    const THRESH_LOW = 80;   // fully transparent below this (handles JPEG noise)
    const THRESH_HIGH = 200; // fully opaque above this

    const render = () => {
      if (!ctx || !canvas || !offCtx) return;

      const img = images[sequence.frame];
      if (!img) return;

      // 1. Draw the raw frame onto the offscreen canvas at native res
      offCtx.clearRect(0, 0, BASE_W, BASE_H);

      const hRatio = BASE_W / img.width;
      const vRatio = BASE_H / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const cx = (BASE_W - img.width * ratio) / 2;
      const cy = (BASE_H - img.height * ratio) / 2;
      offCtx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);

      // 2. Read every pixel and remove the black background
      const imageData = offCtx.getImageData(0, 0, BASE_W, BASE_H);
      const data = imageData.data; // [R, G, B, A, R, G, B, A, ...]

      for (let i = 0, len = data.length; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = r + g + b;

        if (brightness < THRESH_LOW) {
          // Pure black → fully transparent
          data[i + 3] = 0;
        } else if (brightness < THRESH_HIGH) {
          // Soft edge → smooth alpha ramp (anti-aliased edge)
          data[i + 3] = Math.round(((brightness - THRESH_LOW) / (THRESH_HIGH - THRESH_LOW)) * 255);
        }
        // else: keep pixel fully opaque (the neon line itself)
      }

      offCtx.putImageData(imageData, 0, 0);

      // 3. Paint the processed transparent frame onto the visible (high-DPI) canvas
      ctx.clearRect(0, 0, BASE_W, BASE_H);
      ctx.drawImage(offCanvas, 0, 0, BASE_W, BASE_H);
    };

    // ── Preload all 300 frames ─────────────────────────────────
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (i === 0) render();
        if (loadedCount === frameCount) {
          setLoaded(true);
          render();
        }
      };
      images.push(img);
    }

    // ── GSAP ScrollTrigger ─────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=5000",
      pin: true,
      animation: gsap.to(sequence, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: render,
      }),
      scrub: 0.5,
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div className="relative w-full z-10 pointer-events-none">
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
