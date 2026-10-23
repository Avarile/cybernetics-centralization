import { BootScreen } from "@/components/chrome/boot-screen";
import { CommandPalette } from "@/components/chrome/command-palette";
import { StatusBar } from "@/components/chrome/status-bar";
import { TitleBar } from "@/components/chrome/title-bar";
import { Compose } from "@/components/sections/compose";
import { Diff } from "@/components/sections/diff";
import { Hero } from "@/components/sections/hero";
import { KnowDo } from "@/components/sections/know-do";
import { Log } from "@/components/sections/log";
import { Logout } from "@/components/sections/logout";
import { Mcp } from "@/components/sections/mcp";
import { Modules } from "@/components/sections/platforms";
import { Principles } from "@/components/sections/principles";
import { InteractiveShell } from "@/components/sections/shell";
import { Who } from "@/components/sections/who";
import { BASE_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/content";
import { figletText } from "@/lib/figlet";
import { JsonLd, organization } from "@/lib/seo";

// ASCII art is rendered once at build time.
const LOGO_WIDE = figletText("CYBERNETICS", "ANSI Shadow");
const LOGO_NARROW = figletText("CYBERNETICS", "Calvin S");
const LOGO_SMALL = figletText("cybernetics", "Small");

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organization,
            {
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              name: SITE_NAME,
              url: BASE_URL,
              description: SITE_DESCRIPTION,
              publisher: { "@id": organization["@id"] },
            },
          ],
        }}
      />
      <BootScreen />
      <TitleBar />
      <main className="pt-9 pb-7">
        <Hero logo={LOGO_WIDE} />
        {/* <Diff /> */}
        <Principles />
        <KnowDo />
        <Modules />
        <Mcp />
        {/* <Log /> */}
        {/* <Who /> */}
        {/* <Compose /> */}
        {/* <InteractiveShell logo={LOGO_SMALL} logoNarrow={LOGO_NARROW} /> */}
        <Logout />
      </main>
      <StatusBar />
      <CommandPalette />
    </>
  );
}
