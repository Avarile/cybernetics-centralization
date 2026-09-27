/** Full-screen CRT layer: scanlines, vignette and a rolling refresh band. Toggle via [crt]. */
export function CrtOverlay() {
  return (
    <div aria-hidden className="crt-layer pointer-events-none fixed inset-0 z-[70]">
      <div className="crt-scanlines absolute inset-0" />
      <div className="crt-vignette absolute inset-0" />
      <div className="crt-roll absolute inset-0 overflow-hidden" />
    </div>
  );
}
