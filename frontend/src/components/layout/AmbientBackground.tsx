"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme/theme";

const DriftWall: any = dynamic(() => import("@/components/DriftWall"), { ssr: false });

export function AmbientBackground() {
  const { theme } = useTheme();

  return (
    <div className={`fixed inset-0 pointer-events-none z-[1] overflow-hidden transition-opacity duration-500 ${
      theme === "light" ? "opacity-85" : "opacity-95"
    }`}>
      <DriftWall
        columns={7}
        speed={16}
        tilt={12}
        turn={-8}
        tileWidth={230}
        tileHeight={144}
        gap={22}
        radius={18}
        dim={theme === "light" ? 0.75 : 0.88}
        pauseOnHover={false}
        grayscale={false}
        overlayColor="transparent"
      />
    </div>
  );
}
