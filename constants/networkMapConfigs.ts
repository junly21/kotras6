import type { NetworkMapConfig } from "@/types/network";

export const NETWORK_MAP_CONFIGS = {
  main: {
    width: "100%" as const,
    height: 300,
    showZoomControls: true,
    showTooltips: true,
  },
  line: {
    width: "100%" as const,
    height: "100%",
    showZoomControls: true,
    showTooltips: true,
  },
} satisfies Record<string, NetworkMapConfig>; 