import { ImageResponse } from "next/og";
import { cyborgMarkSvg, svgDataUri } from "./cyborg-figure";

/** The mark as a square PNG, for the home-screen and manifest icons. */
export function appIcon(size: number) {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>
      <img src={svgDataUri(cyborgMarkSvg({ detail: true, size }))} width={size} height={size} alt="" />
    ),
    { width: size, height: size },
  );
}
