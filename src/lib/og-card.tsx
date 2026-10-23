import { ImageResponse } from "next/og";
import { cyborgFigureSvg, migrationBarSvg, svgDataUri, type FigureStage } from "./cyborg-figure";

export const OG_SIZE = { width: 1200, height: 630 };

/** 1200×630 card in the campaign's `og` layout (black, white and greys only). */
export function ogCard({
  label,
  title,
  stage,
  cta = "Start your 4-week migration",
}: {
  label: string;
  title: string;
  stage: FigureStage;
  cta?: string;
}) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#000", color: "#fff", padding: "64px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 40 }}>
          <div style={{ fontSize: 20, letterSpacing: 4, color: "#888", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: title.length > 48 ? 54 : 64, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontSize: 24 }}>
            <div style={{ background: "#fff", color: "#000", padding: "8px 16px", fontWeight: 700 }}>{cta}</div>
            <div style={{ color: "#888", marginLeft: 18 }}>avarile.com</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={svgDataUri(cyborgFigureSvg(stage))} width={400} height={400} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgDataUri(migrationBarSvg(stage))} width={240} height={10} alt="" style={{ marginTop: 16 }} />
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
