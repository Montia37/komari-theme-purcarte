import { createContext } from "react";
import type { ConfigOptions, SiteStatus } from "./default";
import { DEFAULT_CONFIG } from "./default";
import type { PublicInfo } from "@/types/node.d";
import { defaultTexts } from "./locales";

export interface ConfigContextType extends ConfigOptions {
  publicSettings: PublicInfo | null;
  siteStatus: SiteStatus;
  texts: typeof defaultTexts;
  previewConfig: Partial<ConfigOptions> | null;
  updatePreviewConfig: (newConfig: Partial<ConfigOptions>) => void;
  reloadConfig: () => Promise<void>;
}

// 创建配置上下文
export const ConfigContext = createContext<ConfigContextType>({
  ...DEFAULT_CONFIG,
  publicSettings: null,
  siteStatus: "public",
  texts: defaultTexts,
  previewConfig: null,
  updatePreviewConfig: () => {},
  reloadConfig: async () => {},
});
