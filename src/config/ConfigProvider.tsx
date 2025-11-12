import { type ReactNode, useEffect, useState, useMemo, useRef } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions, type SiteStatus } from "./default";
import { apiService, getWsService } from "@/services/api";
import Loading from "@/components/loading";
import { defaultTexts, otherTexts } from "./locales";
import { mergeTexts, deepMerge } from "@/utils/localeUtils";

// 配置提供者属性类型
interface ConfigProviderProps {
  children: ReactNode;
}

interface InitializationState {
  publicSettings: PublicInfo;
  config: ConfigOptions;
  siteStatus: SiteStatus;
  loading: boolean;
  isLoaded: boolean;
}

const ConfiguredContent = ({
  isLoaded,
  loading,
  children,
}: {
  isLoaded: boolean;
  loading: boolean;
  children: ReactNode;
}) => {
  if (!isLoaded) {
    return (
      <Loading text="加载配置中..." className={!loading ? "fade-out" : ""} />
    );
  }
  return <>{children}</>;
};

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [initState, setInitState] = useState<InitializationState>({
    publicSettings: {} as PublicInfo,
    config: DEFAULT_CONFIG,
    siteStatus: "public",
    loading: true,
    isLoaded: false,
  });
  const [previewConfig, setPreviewConfig] =
    useState<Partial<ConfigOptions>>(DEFAULT_CONFIG);
  const baseTextsRef = useRef(defaultTexts);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { status, publicInfo } = await apiService.checkSiteStatus();
        let mergedConfig: ConfigOptions;

        if (publicInfo) {
          const themeSettings =
            (publicInfo.theme_settings as ConfigOptions) || {};
          mergedConfig = {
            ...DEFAULT_CONFIG,
            ...themeSettings,
            titleText:
              themeSettings.titleText ||
              publicInfo.sitename ||
              DEFAULT_CONFIG.titleText,
          };
        } else {
          mergedConfig = DEFAULT_CONFIG;
        }

        baseTextsRef.current = mergedConfig.customTexts
          ? mergeTexts(defaultTexts, mergedConfig.customTexts)
          : defaultTexts;

        if (mergedConfig.enableJsonRPC2Api) {
          const versionInfo = await apiService.getVersion();
          if (versionInfo && versionInfo.version) {
            const match = versionInfo.version.match(/(\d+)\.(\d+)\.(\d+)/);
            if (match) {
              const [, major, minor, patch] = match.map(Number);
              if (
                major > 1 ||
                (major === 1 && minor > 0) ||
                (major === 1 && minor === 0 && patch >= 7)
              ) {
                apiService.useRpc = true;
                getWsService().useRpc = true;
                console.log("RPC has been enabled for API and WebSocket.");
              }
            }
          }
        }

        console.log("加载在线配置");
        setInitState((prevState) => ({
          ...prevState,
          publicSettings: publicInfo,
          config: mergedConfig,
          siteStatus: status,
          loading: false,
        }));
        setPreviewConfig(mergedConfig);
      } catch (error) {
        console.error("Failed to initialize site:", error);
        baseTextsRef.current = DEFAULT_CONFIG.customTexts
          ? mergeTexts(defaultTexts, DEFAULT_CONFIG.customTexts)
          : defaultTexts;

        setInitState((prevState) => ({
          ...prevState,
          config: DEFAULT_CONFIG,
          siteStatus: "private-unauthenticated",
          loading: false,
        }));
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (initState.loading === false && initState.isLoaded === false) {
      const timer = setTimeout(() => {
        setInitState((prevState) => ({ ...prevState, isLoaded: true }));
        console.log("config loaded");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initState.loading, initState.isLoaded]);

  const texts = useMemo(() => {
    console.log("加载文本配置=========");
    console.log(previewConfig.blurValue);

    if (previewConfig?.customTexts) {
      const previewBaseTexts = mergeTexts(
        defaultTexts,
        previewConfig.customTexts
      );
      return deepMerge(previewBaseTexts, otherTexts);
    }
    return deepMerge(baseTextsRef.current, otherTexts);
  }, [previewConfig]);

  const updatePreviewConfig = (newConfig: Partial<ConfigOptions>) => {
    console.log("更新预览配置", newConfig);

    setPreviewConfig(newConfig);
  };

  const activeConfig = useMemo(
    () =>
      previewConfig
        ? { ...initState.config, ...previewConfig }
        : initState.config,
    [initState.config, previewConfig]
  );

  return (
    <ConfigContext.Provider
      value={{
        ...activeConfig,
        titleText: initState.config.titleText,
        publicSettings: initState.publicSettings,
        themeSettings: initState.config,
        siteStatus: initState.siteStatus,
        texts,
        previewConfig,
        updatePreviewConfig,
      }}>
      <ConfiguredContent
        isLoaded={initState.isLoaded}
        loading={initState.loading}>
        {children}
      </ConfiguredContent>
    </ConfigContext.Provider>
  );
}
