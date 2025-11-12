import { createContext } from "react";
import type { ConfigOptions, SiteStatus } from "./default";
import { DEFAULT_CONFIG } from "./default";
import type { PublicInfo } from "@/types/node.d";
import { defaultTexts } from "./locales";

export interface ConfigContextType extends ConfigOptions {
  publicSettings: PublicInfo;
  themeSettings: ConfigOptions;
  siteStatus: SiteStatus;
  texts: typeof defaultTexts;
  previewConfig: Partial<ConfigOptions>;
  updatePreviewConfig: (newConfig: Partial<ConfigOptions>) => void;
}

// 创建配置上下文
export const ConfigContext = createContext<ConfigContextType>({
  ...DEFAULT_CONFIG,
  publicSettings: {} as PublicInfo,
  themeSettings: DEFAULT_CONFIG,
  siteStatus: "public",
  texts: defaultTexts,
  previewConfig: DEFAULT_CONFIG,
  updatePreviewConfig: () => {},
});
