import { rssFeed } from "@/lib/feed";

// Static export: written to out/blog/feed.xml at build time.
export const dynamic = "force-static";

export function GET() {
  return rssFeed("en");
}
