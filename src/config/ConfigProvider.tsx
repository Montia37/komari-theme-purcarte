import { type ReactNode, useEffect, useMemo } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions } from "./default";

// 配置提供者属性类型
interface ConfigProviderProps {
  publicSettings: PublicInfo | null; // 公共设置，可能为 null
  children: ReactNode;
}

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({
  publicSettings,
  children,
}: ConfigProviderProps) {
  const theme = useMemo(() => {
    return (publicSettings?.theme_settings as ConfigOptions) || {};
  }, [publicSettings?.theme_settings]);

  // 使用 useMemo 缓存背景图片，避免每次渲染时重新计算
  const backgroundImage = useMemo(() => {
    return theme.backgroundImage || "";
  }, [theme.backgroundImage]);

  // 背景切换逻辑
  useEffect(() => {
    if (backgroundImage) {
      document.body.style.setProperty(
        "--body-background-url",
        `url(${backgroundImage})`
      );
    } else {
      document.body.style.removeProperty("--body-background-url");
    }
  }, [backgroundImage]);

  const config: ConfigOptions = useMemo(
    () => ({
      tagDefaultColorList:
        theme.tagDefaultColorList || DEFAULT_CONFIG.tagDefaultColorList,
      enableLogo: theme.enableLogo ?? DEFAULT_CONFIG.enableLogo,
      logoUrl: theme.logoUrl || DEFAULT_CONFIG.logoUrl,
      enableTitle: theme.enableTitle ?? DEFAULT_CONFIG.enableTitle,
      titleText:
        theme.titleText || publicSettings?.sitename || DEFAULT_CONFIG.titleText,
      enableSearchButton:
        theme.enableSearchButton ?? DEFAULT_CONFIG.enableSearchButton,
      selectedDefaultView:
        theme.selectedDefaultView || DEFAULT_CONFIG.selectedDefaultView,
      selectedDefaultAppearance:
        theme.selectedDefaultAppearance ||
        DEFAULT_CONFIG.selectedDefaultAppearance,
      enableAdminButton:
        theme.enableAdminButton ?? DEFAULT_CONFIG.enableAdminButton,
      enableStatsBar: theme.enableStatsBar ?? DEFAULT_CONFIG.enableStatsBar,
      enableGroupedBar:
        theme.enableGroupedBar ?? DEFAULT_CONFIG.enableGroupedBar,
      enableInstanceDetail:
        theme.enableInstanceDetail ?? DEFAULT_CONFIG.enableInstanceDetail,
      enablePingChart: theme.enablePingChart ?? DEFAULT_CONFIG.enablePingChart,
      pingChartMaxPoints:
        theme.pingChartMaxPoints || DEFAULT_CONFIG.pingChartMaxPoints,
      backgroundImage,
      enableSwap: theme.enableSwap ?? DEFAULT_CONFIG.enableSwap,
    }),
    [theme, backgroundImage, publicSettings?.sitename]
  );

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
