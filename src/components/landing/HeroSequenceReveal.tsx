import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";

const TOTAL_FRAMES = 151;
const FRAME_PREFIX = "/hero-sequence/ezgif-frame-";

const getFramePath = (index: number) => {
  const paddedIndex = index.toString().padStart(3, "0");
  return `${FRAME_PREFIX}${paddedIndex}.jpg`;
};

export default function HeroSequenceReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(loadedCount / TOTAL_FRAMES);
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }
  }, []);

  // Draw image to canvas with "cover" sizing logic
  const drawImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let renderWidth, renderHeight, x, y;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image (relative) - fit to width
      renderWidth = canvas.width;
      renderHeight = canvas.width / imgRatio;
      x = 0;
      y = (canvas.height - renderHeight) / 2;
    } else {
      // Canvas is taller than image (relative) - fit to height
      renderHeight = canvas.height;
      renderWidth = canvas.height * imgRatio;
      y = 0;
      x = (canvas.width - renderWidth) / 2;
    }

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, renderWidth, renderHeight);
  };

  // Handle resizing and drawing the initial frame
  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-draw current frame on resize
      const currentIndex = Math.floor(smoothProgress.get() * (TOTAL_FRAMES - 1));
      drawImage(ctx, images[currentIndex]);
    };

    handleResize(); // Initial setup
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, images, smoothProgress]);

  // Handle scroll updates
  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const unsubscribe = smoothProgress.on("change", (latest) => {
      // Map 0-1 to 0-(TOTAL_FRAMES - 1)
      const frameIndex = Math.floor(latest * (TOTAL_FRAMES - 1));
      const frame = images[frameIndex];
      if (frame) {
        drawImage(ctx, frame);
      }
    });

    return () => unsubscribe();
  }, [isLoaded, images, smoothProgress]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#0B1020]" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0B1020] flex items-center justify-center">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0B1020]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <div className="text-primary font-mono text-sm">
              Loading {Math.round(loadingProgress * 100)}%
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}
