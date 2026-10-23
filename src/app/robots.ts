import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

// Static export: written to out/robots.txt at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // The checklist PDF is the sign-up reward; /start itself is noindex.
    rules: { userAgent: "*", allow: "/", disallow: "/downloads/" },
    sitemap: absolute("/sitemap.xml"),
  };
}
