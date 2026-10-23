"use client";

import { useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Figure } from "@/lib/content";
import { Bar, Spinner } from "./bits";
import { Box } from "./box";
import { useRevealed } from "./tui-section";

const LOADER_CELLS = 16;
/** Shortest time the loader stays up, so a cached figure does not flash it. */
const LOADER_MIN_MS = 500;

/** Terminal-style loader: braille spinner over a sweeping `[███░░░]` bar. */
function Loader({ name }: { name: string }) {
  const [fill, setFill] = useState(2);
  useEffect(() => {
    const t = setInterval(() => setFill((f) => (f + 1) % (LOADER_CELLS + 1)), 90);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      role="status"
      aria-label={`Loading ${name}`}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-(--figure-bg) text-xs"
    >
      <p>
        <Spinner className="text-accent" /> <span className="text-dim">loading</span> fig/{name}
        <span className="text-dim">…</span>
      </p>
      <Bar fill={fill} cells={LOADER_CELLS} tone="var(--accent)" />
    </div>
  );
}

/**
 * An interactive isometric figure (public/figures/*.html, light build) in a window frame.
 * The iframe only gets its `src` once the figure has been scrolled near, so the five
 * heavy pages never compete with first paint.
 */
export function FigureEmbed({
  figure,
  tone,
  ratio = "aspect-[4/3.3]",
  caption = true,
  bare = false,
  stage,
}: {
  figure: Figure;
  tone?: string;
  ratio?: string;
  caption?: boolean;
  /** No frame: the figure sits directly on the page, without its own card border either. */
  bare?: boolean;
  /**
   * Fixed-size stage (height ÷ width): every figure is laid out at a common width and
   * scaled to fit it, so all figures take exactly the same space. Capped so the stage fits
   * the viewport below the carousel tabs.
   */
  stage?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "400px" });
  const revealed = useRevealed();
  const [height, setHeight] = useState<number>();
  const [minDone, setMinDone] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), LOADER_MIN_MS);
    return () => clearTimeout(t);
  }, []);
  const [box, setBox] = useState<{ w: number; h: number }>();

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !stage) return;
    const measure = () => {
      const w = el.clientWidth;
      setBox({
        w,
        h: Math.round(
          Math.min(w * stage, Math.max(460, window.innerHeight - 200)),
        ),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage]);

  // Figures are our own same-origin pages: size the frame to the figure so nothing scrolls inside it.
  const fit = useCallback(
    (frame: HTMLIFrameElement) => {
      const doc = frame.contentDocument;
      if (!doc) return;
      // Crop to the figure card: the page's long text description sits in its legend.
      const card = doc.querySelector(".iso-figure");
      doc
        .querySelectorAll<HTMLElement>(".iso-legend")
        .forEach((el) => (el.style.display = "none"));
      doc.documentElement.style.overflow = "hidden";
      // White backdrop; bare also drops the card border and page margins.
      const style = doc.createElement("style");
      style.textContent = `html{color-scheme:light!important}html,body{background:#fff!important}.iso-plate{background:#fff!important}${
        bare
          ? ".iso-page{width:100%!important;margin:0!important}.iso-figure{margin:0!important}.iso-plate{box-shadow:none!important}"
          : ""
      }`;
      doc.head.appendChild(style);
      const measure = () =>
        setHeight(
          card
            ? Math.ceil(
                card.getBoundingClientRect().bottom + doc.defaultView!.scrollY,
              ) + 24
            : doc.documentElement.scrollHeight,
        );
      measure();
      new ResizeObserver(measure).observe(doc.documentElement);
    },
    [bare],
  );

  const iframe = (style?: React.CSSProperties, className = "size-full") =>
    near &&
    revealed && (
      <iframe
        src={figure.src}
        title={figure.title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        onLoad={(e) => fit(e.currentTarget)}
        style={style}
        className={`${className} border-0 grayscale`}
      />
    );

  // Stage mode: lay the page out at NATURAL_W, then scale it to fit the fixed stage, centred.
  const NATURAL_W = 900;
  const scale = box && height ? Math.min(box.w / NATURAL_W, box.h / height) : 0;
  const ready = minDone && (stage ? scale > 0 : !!height);
  const fade = { opacity: ready ? 1 : 0, transition: "opacity 300ms ease-out" };

  const frame = stage ? (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden bg-(--figure-bg)"
      style={{ height: box?.h ?? 0 }}
    >
      {iframe(
        {
          position: "absolute",
          width: NATURAL_W,
          height: height ?? 1400,
          left: box ? (box.w - NATURAL_W * scale) / 2 : 0,
          top: box && height ? (box.h - height * scale) / 2 : 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          ...fade,
        },
        "",
      )}
      {!ready && <Loader name={figure.id} />}
    </div>
  ) : (
    <div
      className={`${height ? "" : ratio} relative w-full overflow-hidden bg-(--figure-bg)`}
      style={height ? { height } : undefined}
    >
      {iframe(fade)}
      {!ready && <Loader name={figure.id} />}
    </div>
  );

  return (
    <figure ref={ref} className="min-w-0">
      {bare ? (
        frame
      ) : (
        <Box
          term
          tone={tone}
          title={`fig · ${figure.id}`}
          right={<span className="text-dim">interactive</span>}
          bodyClassName="p-0"
        >
          {frame}
        </Box>
      )}
      {caption && (
        <figcaption className="mt-3 max-w-[68ch] text-xs text-dim">
          <span className="text-accent">fig.</span> {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}
