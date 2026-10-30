// Animated dusk backdrop for the hero: sky gradient, drifting clouds at three depths,
// a glowing horizon, and a sea with moving waves. Purely decorative.
// Keyframes live in index.css and are disabled for reduced-motion users.

type Puff = [x: number, y: number, r: number];

const nearClouds: Puff[] = [
  [90, 120, 26], [120, 108, 34], [158, 118, 24], [560, 112, 30], [598, 100, 38], [636, 116, 22], [900, 118, 28], [934, 106, 24],
];
const midClouds: Puff[] = [
  [30, 70, 20], [62, 60, 26], [270, 84, 18], [300, 74, 22], [640, 60, 20], [676, 52, 24], [985, 80, 18],
];
const farClouds: Puff[] = [
  [180, 40, 14], [206, 34, 18], [470, 46, 14], [500, 38, 16], [800, 42, 14],
];

// Duplicate each cloud set 1000 units to the right so the strip loops seamlessly.
function withLoopCopy(puffs: Puff[]): Puff[] {
  return [...puffs, ...puffs.map(([x, y, r]): Puff => [x + 1000, y, r])];
}

function CloudStrip({ puffs, className, duration, opacity }: { puffs: Puff[]; className: string; duration: string; opacity: number }) {
  return (
    <div
      className={`cloud-strip absolute left-0 h-2/5 w-[200%] ${className}`}
      style={{ animationDuration: duration, opacity }}
    >
      <svg viewBox="0 0 2000 300" preserveAspectRatio="none" className="size-full">
        <g fill="#ffffff" style={{ filter: 'blur(5px)' }}>
          {withLoopCopy(puffs).map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
      </svg>
    </div>
  );
}

const wavePath = (() => {
  const points: string[] = [];
  for (let x = 0; x <= 2000; x += 20) {
    const y = 40 + 10 * Math.sin((x / 200) * Math.PI * 2);
    points.push(`${x} ${y.toFixed(1)}`);
  }
  return `M${points.join(' L')} L2000 120 L0 120 Z`;
})();

export default function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#9fd3f5] via-[#d7edfb] to-[#ffffff]" />

      <div className="absolute inset-x-0 bottom-24 flex justify-center">
        <div className="sun-glow size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(160,214,248,0.35)_40%,transparent_70%)]" />
      </div>

      <CloudStrip puffs={farClouds} className="top-12" duration="140s" opacity={0.2} />
      <CloudStrip puffs={midClouds} className="top-20" duration="95s" opacity={0.3} />
      <CloudStrip puffs={nearClouds} className="top-16" duration="60s" opacity={0.45} />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#b6dcf5] to-transparent" />
      <div className="wave-strip absolute inset-x-0 bottom-0 h-24 w-[200%] opacity-70">
        <svg viewBox="0 0 2000 120" preserveAspectRatio="none" className="size-full">
          <path d={wavePath} fill="#8fcaf0" />
        </svg>
      </div>
      <div className="wave-strip absolute inset-x-0 bottom-0 h-16 w-[200%] opacity-60" style={{ animationDuration: '14s' }}>
        <svg viewBox="0 0 2000 120" preserveAspectRatio="none" className="size-full">
          <path d={wavePath} fill="#6bbbe9" transform="translate(0 20)" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(120,190,240,0.35)_100%)]" />
    </div>
  );
}
