import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function useRevealOnScroll<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reduced || !enabled);

  useEffect(() => {
    if (reduced || !enabled) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, enabled]);

  return { ref, visible };
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  variant?: "up" | "fade" | "left" | "right" | "scale";
  id?: string;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  variant = "up",
  id,
}: RevealProps) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  const base =
    variant === "fade"
      ? "reveal-fade"
      : variant === "left"
        ? "reveal-left"
        : variant === "right"
          ? "reveal-right"
          : variant === "scale"
            ? "reveal-scale"
            : "reveal";

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  step?: number;
  baseDelay?: number;
};

/** Wraps each child in Reveal with staggered delays. */
export function Stagger({
  children,
  className = "",
  itemClassName = "",
  step = 80,
  baseDelay = 0,
}: StaggerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) {
          return (
            <Reveal key={i} delay={baseDelay + i * step} className={itemClassName}>
              {child}
            </Reveal>
          );
        }
        return (
          <Reveal key={child.key ?? i} delay={baseDelay + i * step} className={itemClassName}>
            {cloneElement(child as ReactElement)}
          </Reveal>
        );
      })}
    </div>
  );
}

export function useCountUp(target: number, active: boolean, duration = 1600) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduced]);

  return value;
}

type CountUpProps = {
  target: number;
  active: boolean;
  duration?: number;
  className?: string;
  suffix?: string;
};

export function CountUp({ target, active, duration, className = "", suffix = "" }: CountUpProps) {
  const value = useCountUp(target, active, duration);
  return (
    <span className={className}>
      {value.toLocaleString("uz")}
      {suffix}
    </span>
  );
}

/** Hook: set active when element enters viewport (once). */
export function useInViewOnce<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  return { ref, active };
}
