import { appIcon } from "@/lib/app-icon";

// Static export: written to out/apple-touch-icon.png, the path iOS also requests by default.
export const dynamic = "force-static";

export function GET() {
  return appIcon(180);
}
