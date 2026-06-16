import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    // Skip on touch/coarse pointer devices (phones, tablets)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Add class to body to hide default cursor
    document.body.classList.add('hide-native-cursor');

    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Translate cursor wrapper so bottom-left of the 48x48px wrapper is at the mouse position
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY - 48}px)`;
      }
      setIsVisible(true);
    };

    const onLeaveDoc = () => setIsVisible(false);
    const onEnterDoc = () => setIsVisible(true);

    let glowTimeout: ReturnType<typeof setTimeout>;
    const onDblClick = () => {
      setIsGlowing(true);
      clearTimeout(glowTimeout);
      glowTimeout = setTimeout(() => {
        setIsGlowing(false);
      }, 1500); // Glow lasts 1.5 seconds
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeaveDoc);
    document.addEventListener('mouseenter', onEnterDoc);
    document.addEventListener('dblclick', onDblClick);

    // Trigger initial visibility
    setIsVisible(true);

    return () => {
      document.body.classList.remove('hide-native-cursor');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeaveDoc);
      document.removeEventListener('mouseenter', onEnterDoc);
      document.removeEventListener('dblclick', onDblClick);
      clearTimeout(glowTimeout);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[99999] w-12 h-12"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s',
        willChange: 'transform',
      }}
    >
      {/* Glow Effect centered at the pen tip (bottom-left of wrapper) */}
      {isGlowing && (
        <div className="absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-none">
          {/* Inner bright pulsing core */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-sm animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(216, 188, 234, 0.8) 0%, rgba(216, 188, 234, 0.2) 70%)',
              boxShadow: '0 0 30px 10px rgba(216, 188, 234, 0.6)'
            }}
          />
          {/* Outer expanding ping ring */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-primary/40 animate-ping"
            style={{
              borderColor: 'rgba(216, 188, 234, 0.6)',
              boxShadow: '0 0 20px rgba(216, 188, 234, 0.4)'
            }}
          />
          {/* Second wider delay ring */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-primary/20 animate-ping [animation-delay:0.3s]"
            style={{
              borderColor: 'rgba(216, 188, 234, 0.3)'
            }}
          />
        </div>
      )}

      {/* Pen Image */}
      <img
        src="/pen.png"
        alt="cursor"
        className="w-full h-full object-contain drop-shadow-md relative z-10"
      />
    </div>
  );
}
