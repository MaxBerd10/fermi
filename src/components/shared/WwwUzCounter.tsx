import { useEffect, useMemo, useState } from "react";

/** Official www.uz (milliy reyting) counter for fjsti.uz */
const WWW_UZ_ID = "45686";

/**
 * www.uz TOP-RATING badge (TAS-IX stats).
 * Builds the classic collect URL in React instead of document.write.
 */
export default function WwwUzCounter() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const page = typeof window !== "undefined" ? window.location.href : "https://fjsti.uz/";
    const wh =
      typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : "";
    const px =
      typeof screen !== "undefined"
        ? String(screen.colorDepth || screen.pixelDepth || "")
        : "";

    const params = new URLSearchParams({
      id: WWW_UZ_ID,
      r: referrer,
      pg: page,
      c: "Y",
      j: "N",
      wh,
      px,
      js: "1.3",
      col: "340F6E",
      t: "ffffff",
      p: "BD6F6F",
    });

    setSrc(`https://cnt0.www.uz/counter/collect?${params.toString()}`);
  }, []);

  const href = useMemo(
    () => `https://www.uz/uz/res/visitor/index?id=${WWW_UZ_ID}`,
    [],
  );

  if (!src) {
    return (
      <span
        className="inline-block w-[88px] h-[31px] rounded-sm bg-[#340F6E]/80"
        aria-hidden
      />
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="www.uz — milliy reyting"
      className="inline-block leading-none hover:opacity-90 transition-opacity cursor-pointer"
    >
      <img
        src={src}
        width={88}
        height={31}
        alt="www.uz"
        className="block w-[88px] h-[31px]"
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}
