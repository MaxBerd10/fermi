import { useEffect, useState } from "react";

/** Qabul-2027 deadline — 15 July 2027, 23:59 (Uzbekistan, UTC+5) */
export const ADMISSION_DEADLINE = new Date("2027-07-15T23:59:00+05:00");

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalMs: number;
};

function calc(now: number): CountdownParts {
  const totalMs = ADMISSION_DEADLINE.getTime() - now;
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0 };
  }
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    expired: false,
    totalMs,
  };
}

export function useAdmissionCountdown(): CountdownParts {
  const [parts, setParts] = useState(() => calc(Date.now()));

  useEffect(() => {
    const id = window.setInterval(() => setParts(calc(Date.now())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return parts;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
