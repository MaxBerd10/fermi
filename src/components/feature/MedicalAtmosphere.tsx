import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/Animation";

/**
 * Soft grid, faint FJSTI, pulsing +, heartbeat impulses, 5 organ icons.
 */
const PLUS_SPOTS = [
  { className: "med-atmosphere__plus--1", delay: "0s", duration: "3.4s" },
  { className: "med-atmosphere__plus--2", delay: "0.7s", duration: "3.8s" },
  { className: "med-atmosphere__plus--3", delay: "1.4s", duration: "4.1s" },
  { className: "med-atmosphere__plus--4", delay: "0.3s", duration: "3.6s" },
  { className: "med-atmosphere__plus--5", delay: "1.9s", duration: "4.4s" },
] as const;

/** 5 organ / body icons — faint, like + marks */
const ORGAN_ICONS = [
  { icon: "ri-heart-pulse-line", className: "med-atmosphere__organ--1", delay: "0s" },
  { icon: "ri-lungs-line", className: "med-atmosphere__organ--2", delay: "0.6s" },
  { icon: "ri-brain-line", className: "med-atmosphere__organ--3", delay: "1.2s" },
  { icon: "ri-mental-health-line", className: "med-atmosphere__organ--4", delay: "1.8s" },
  { icon: "ri-dna-line", className: "med-atmosphere__organ--5", delay: "2.4s" },
] as const;

export default function MedicalAtmosphere() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { x: nx, y: ny };
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.05;
      current.current.y += (target.current.y - current.current.y) * 0.05;
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--mx", current.current.x.toFixed(3));
        el.style.setProperty("--my", current.current.y.toFixed(3));
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  const staticCls = reduced ? " is-static" : "";

  return (
    <div
      ref={rootRef}
      className="med-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
    >
      <div className="med-atmosphere__base" />
      <div className="med-atmosphere__grid" />

      <div className="med-atmosphere__orb med-atmosphere__orb--a" />
      <div className="med-atmosphere__orb med-atmosphere__orb--b" />

      {/* Faint floating FJSTI marks */}
      <p className={`med-atmosphere__mark med-atmosphere__mark--a${staticCls}`}>FerMI</p>
      <p className={`med-atmosphere__mark med-atmosphere__mark--b med-hide-sm${staticCls}`}>FerMI</p>
      <p className={`med-atmosphere__mark med-atmosphere__mark--c med-hide-md${staticCls}`}>FerMI</p>

      {/* Faint pulsing + marks */}
      {PLUS_SPOTS.map((p) => (
        <span
          key={p.className}
          className={`med-atmosphere__plus ${p.className}${staticCls}`}
          style={{
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          +
        </span>
      ))}

      {/* 5 organ icons — same faint style as + */}
      {ORGAN_ICONS.map((o, i) => (
        <span
          key={o.className}
          className={`med-atmosphere__organ ${o.className}${i >= 3 ? " med-hide-sm" : ""}${staticCls}`}
          style={{ animationDelay: o.delay }}
        >
          <i className={o.icon} />
        </span>
      ))}

      {/* Heartbeat impulse (lub-dub) at scattered spots */}
      <span className={`med-atmosphere__heartbeat med-atmosphere__heartbeat--a${staticCls}`} />
      <span className={`med-atmosphere__heartbeat med-atmosphere__heartbeat--b med-hide-sm${staticCls}`} />
      <span className={`med-atmosphere__heartbeat med-atmosphere__heartbeat--c med-hide-md${staticCls}`} />
    </div>
  );
}
