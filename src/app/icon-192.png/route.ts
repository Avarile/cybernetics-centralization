import { appIcon } from "@/lib/app-icon";

// Static export: written to out/icon-192.png at build time. Listed in the web manifest.
export const dynamic = "force-static";

export function GET() {
  return appIcon(192);
}
