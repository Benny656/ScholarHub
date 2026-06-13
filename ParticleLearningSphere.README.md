# ParticleLearningSphere

Drop `ParticleLearningSphere.tsx` into a Next.js app, then render it inside any responsive Tailwind layout:

```tsx
import dynamic from "next/dynamic";

const ParticleLearningSphere = dynamic(
  () => import("@/components/ParticleLearningSphere"),
  { ssr: false },
);

export function HeroVisual() {
  return (
    <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-2">
      <ParticleLearningSphere className="h-[440px] sm:h-[560px]" />
    </div>
  );
}
```

Install dependencies if your app does not already have them:

```bash
npm install three @react-three/fiber @react-three/drei
```

Notes:
- Uses one `THREE.BufferGeometry` point cloud for all 1,500 particles.
- Drag/swipe velocity decays with a `0.965` friction multiplier.
- Tapping/clicking while inertia is active resets velocity immediately.
- DPR is capped at `2`; antialiasing is disabled above DPR `1`.
- A mobile FPS governor fades particles and lowers ambient intensity when frame rate drops below 45 FPS.
