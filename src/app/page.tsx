import { BootScreen } from "@/components/chrome/boot-screen";
import { CommandPalette } from "@/components/chrome/command-palette";
import { CrtOverlay } from "@/components/chrome/crt-overlay";
import { StatusBar } from "@/components/chrome/status-bar";
import { TitleBar } from "@/components/chrome/title-bar";
import { Compose } from "@/components/sections/compose";
import { Diff } from "@/components/sections/diff";
import { Hero } from "@/components/sections/hero";
import { KnowDo } from "@/components/sections/know-do";
import { Log } from "@/components/sections/log";
import { Logout } from "@/components/sections/logout";
import { Mcp } from "@/components/sections/mcp";
import { Modules } from "@/components/sections/modules";
import { InteractiveShell } from "@/components/sections/shell";
import { Who } from "@/components/sections/who";
import { figletText } from "@/lib/figlet";

// ASCII art is rendered once at build time.
const LOGO_WIDE = figletText("CYBERNETICS", "ANSI Shadow");
const LOGO_NARROW = figletText("CYBERNETICS", "Calvin S");
const LOGO_SMALL = figletText("cybernetics", "Small");

export default function Home() {
  return (
    <>
      <BootScreen />
      <TitleBar />
      <main className="pt-9 pb-7">
        <Hero logoWide={LOGO_WIDE} logoNarrow={LOGO_NARROW} />
        <Diff />
        <KnowDo />
        <Modules />
        <Mcp />
        <Log />
        <Who />
        <Compose />
        <InteractiveShell logo={LOGO_SMALL} logoNarrow={LOGO_NARROW} />
        <Logout />
      </main>
      <StatusBar />
      <CommandPalette />
      <CrtOverlay />
    </>
  );
}
