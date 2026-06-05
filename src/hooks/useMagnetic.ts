import { useRef, useState, useCallback } from 'react';

/**
 * Magnetic button effect — wraps a button in a div that
 * subtly follows the cursor, snapping back elastically on leave.
 *
 * Usage:
 *   const { ref, magnetStyle, handleMouseMove, handleMouseLeave } = useMagnetic();
 *   <div ref={ref} style={magnetStyle} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
 *     <button>Click me</button>
 *   </div>
 */
export function useMagnetic(strength = 0.38) {
  const ref = useRef<HTMLDivElement>(null);
  const [magnetStyle, setMagnetStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
      setMagnetStyle({
        transform: `translate(${dx}px, ${dy}px)`,
        transition: 'transform 0.08s linear',
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    setMagnetStyle({
      transform: 'translate(0px, 0px)',
      transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  }, []);

  return { ref, magnetStyle, handleMouseMove, handleMouseLeave };
}
