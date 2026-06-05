import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Global custom cursor — a filled dot that follows the cursor instantly,
 * plus a larger ring that follows with a smooth lag (trail effect).
 * Grows on hover over interactive elements. Touch devices are skipped.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Skip on touch/coarse pointer devices (phones, tablets)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('custom-cursor');

    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const hoverState = { active: false };
    let raf: number;

    /* ── Dot follows cursor instantly via direct DOM mutation ── */
    const moveDot = (x: number, y: number) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      }
    };

    /* ── Ring follows with smooth lag via RAF ── */
    const animateRing = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.13;
      ringPos.y += (mouse.y - ringPos.y) * 0.13;

      if (ringRef.current) {
        const size = hoverState.active ? 46 : 32;
        ringRef.current.style.transform = `translate(${ringPos.x - size / 2}px, ${ringPos.y - size / 2}px)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
      }

      raf = requestAnimationFrame(animateRing);
    };

    /* ── Event handlers ── */
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      moveDot(e.clientX, e.clientY);
      setIsVisible(true);
    };

    const onLeaveDoc = () => setIsVisible(false);
    const onEnterDoc = () => setIsVisible(true);

    // Event delegation — works for dynamically added elements too
    const onOver = (e: MouseEvent) => {
      const t = (e.target as Element).closest(
        'button, a, [role="button"], input, textarea, select, label, .ripple-btn'
      );
      if (t) {
        hoverState.active = true;
        setIsHovering(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      const t = (e.target as Element).closest(
        'button, a, [role="button"], input, textarea, select, label, .ripple-btn'
      );
      const rel = e.relatedTarget as Element | null;
      if (t && (!rel || !t.contains(rel))) {
        hoverState.active = false;
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeaveDoc);
    document.addEventListener('mouseenter', onEnterDoc);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(animateRing);

    return () => {
      document.body.classList.remove('custom-cursor');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeaveDoc);
      document.removeEventListener('mouseenter', onEnterDoc);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
    };
  }, []); // run once

  // Cursor color follows theme
  const color = isDark ? '#d8bcea' : '#1978e5';

  return (
    <>
      {/* Dot — instant follow */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full"
        style={{
          background: color,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s, background-color 0.5s',
          willChange: 'transform',
        }}
      />
      {/* Ring — lagging follow with size transition on hover */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          border: `1.5px solid ${color}`,
          opacity: isVisible ? (isHovering ? 0.8 : 0.35) : 0,
          transition: 'opacity 0.3s, border-color 0.5s, width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          willChange: 'transform, width, height',
        }}
      />
    </>
  );
}
