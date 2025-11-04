import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppConfig, useLocale } from "@/config/hooks";
import type { ConfigOptions } from "@/config/default";
import { DEFAULT_CONFIG } from "@/config/default";
import { defaultTexts } from "@/config/locales";
import { apiService } from "@/services/api";
import SettingItem from "./SettingItem";
import CustomTextsEditor from "./CustomTextsEditor";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { t } = useLocale();
  const config = useAppConfig();
  const { publicSettings, updatePreviewConfig, reloadConfig } = config;
  const [settingsConfig, setSettingsConfig] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<Partial<ConfigOptions>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState("main");
  const [customTextsPage, setCustomTextsPage] = useState("main");
  const [isPreviewing, setIsPreviewing] = useState(true);
  const isMobile = useIsMobile();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    const fetchSettingsConfig = async () => {
      if (publicSettings?.theme) {
        try {
          const response = await fetch(
            `/themes/${publicSettings.theme}/komari-theme.json`
          );
          const data = await response.json();
          setSettingsConfig(data.configuration.data);
        } catch (error) {
          console.error(t("setting.fetchError"), error);
        }
      }
    };

    fetchSettingsConfig();
  }, [publicSettings?.theme, t]);

  useEffect(() => {
    setEditingConfig(publicSettings?.theme_settings || {});
  }, [publicSettings?.theme_settings]);

  useEffect(() => {
    updatePreviewConfig(editingConfig);
    const hasChanges =
      JSON.stringify(editingConfig) !==
      JSON.stringify(publicSettings?.theme_settings || {});
    setHasUnsavedChanges(hasChanges);
  }, [editingConfig, publicSettings?.theme_settings, updatePreviewConfig]);

  useEffect(() => {
    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  const handleConfigChange = (key: keyof ConfigOptions, value: any) => {
    const newConfig = { ...editingConfig, [key]: value };
    setEditingConfig(newConfig);
    if (isPreviewing) {
      updatePreviewConfig(newConfig);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      await apiService.saveThemeSettings(
        publicSettings?.theme || "",
        editingConfig
      );
      toast.success(t("setting.saveSuccess"));
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
      await reloadConfig();
      onClose();
    } catch (error) {
      console.error(t("setting.saveThemeError"), error);
      toast.error(t("setting.saveError"));
    }
  }, [editingConfig, onClose, publicSettings, reloadConfig, t]);

  const handleReset = () => {
    toast(t("setting.resetConfirm"), {
      action: {
        label: t("setting.resetConfirmAction"),
        onClick: () => {
          setEditingConfig(DEFAULT_CONFIG);
          if (toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
          }
        },
      },
    });
  };

  useEffect(() => {
    if (hasUnsavedChanges && !toastId.current) {
      toastId.current = toast(t("setting.unsavedChanges"), {
        duration: Infinity,
        cancel: {
          label: t("setting.cancel"),
          onClick: async () => {
            await reloadConfig();
            toast.success(t("setting.unsavedChangesDesc"));
          },
        },
      });
    } else if (!hasUnsavedChanges && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [hasUnsavedChanges, reloadConfig, t]);

  const handlePreviewToggle = () => {
    if (isPreviewing) {
      updatePreviewConfig({});
      setIsPreviewing(false);
    } else {
      updatePreviewConfig(editingConfig);
      setIsPreviewing(true);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(publicSettings?.theme_settings || {}));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "komari-theme-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          const sanitizedConfig: Partial<ConfigOptions> = {};
          for (const key in DEFAULT_CONFIG) {
            if (Object.prototype.hasOwnProperty.call(importedConfig, key)) {
              (sanitizedConfig as any)[key] = (importedConfig as any)[key];
            }
          }
          setEditingConfig(sanitizedConfig);
          toast.success(t("setting.importSuccess"), {
            action: {
              label: t("setting.save"),
              onClick: () => setTimeout(() => handleSave(), 300),
            },
          });
        } catch (error) {
          console.error(t("setting.importConfigError"), error);
          toast.error(t("setting.importError"));
        }
      };
      reader.readAsText(file);
    }
  };

  const panelClasses = isMobile
    ? "fixed bottom-0 left-0 w-full h-3/4 bg-gray-100/90 dark:bg-gray-900/90 theme-card-style shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
    : "h-screen w-(--setting-width) bg-gray-100/90 dark:bg-gray-900/90 theme-card-style shadow-lg p-4 overflow-y-auto flex-shrink-0";

  if (!isOpen) return null;

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("setting.title")}</h2>
        <Button
          onClick={() => {
            if (isPreviewing) {
              updatePreviewConfig({});
            }
            onClose();
          }}
          variant="ghost">
          {t("setting.close")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button asChild>
          <label htmlFor="import-config">
            {t("setting.import")}
            <input
              id="import-config"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </Button>
        <Button onClick={handleExport}>{t("setting.export")}</Button>
        <Button onClick={handlePreviewToggle}>
          {isPreviewing
            ? t("setting.togglePreview.on")
            : t("setting.togglePreview.off")}
        </Button>
        <Button onClick={handleReset}>{t("setting.reset")}</Button>
        <Button onClick={handleSave} className="bg-green-500">
          {t("setting.save")}
        </Button>
      </div>
      <div className="flex items-center mb-4">
        <span
          onClick={() => {
            if (currentPage === "main" && customTextsPage === "main") return;
            if (customTextsPage !== "main") {
              setCustomTextsPage("main");
            } else {
              setCurrentPage("main");
            }
          }}
          className={`mr-2 cursor-pointer hover:underline ${
            currentPage === "main" && customTextsPage === "main"
              ? "invisible"
              : ""
          }`}>
          <ArrowLeft className="h-4 w-4" />
        </span>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center flex-wrap">
          <span
            className={
              currentPage !== "main"
                ? "cursor-pointer hover:underline"
                : "cursor-default"
            }
            onClick={() => {
              if (currentPage !== "main") {
                setCurrentPage("main");
                setCustomTextsPage("main");
              }
            }}>
            {t("setting.home")}
          </span>
          {currentPage !== "main" && (
            <>
              <span className="mx-1">/</span>
              <span
                className={
                  currentPage === t("setting.customUI") &&
                  customTextsPage !== "main"
                    ? "cursor-pointer hover:underline"
                    : "cursor-default"
                }
                onClick={() => {
                  if (currentPage === t("setting.customUI")) {
                    setCustomTextsPage("main");
                  }
                }}>
                {currentPage}
              </span>
            </>
          )}
          {currentPage === t("setting.customUI") &&
            customTextsPage !== "main" && (
              <>
                <span className="mx-1">/</span>
                <span className="cursor-default">
                  {(
                    defaultTexts[
                      customTextsPage as keyof typeof defaultTexts
                    ] as any
                  )?._ || customTextsPage}
                </span>
              </>
            )}
        </div>
      </div>
      <div className="space-y-4">
        {currentPage === "main" ? (
          settingsConfig
            .filter((item) => item.type === "title")
            .map((item) => (
              <Button
                key={item.name}
                onClick={() => setCurrentPage(item.name)}
                className="w-full justify-start">
                {item.name}
              </Button>
            ))
        ) : (
          <>
            {settingsConfig
              .slice(
                settingsConfig.findIndex((item) => item.name === currentPage) +
                  1,
                settingsConfig.findIndex(
                  (item, index) =>
                    index >
                      settingsConfig.findIndex(
                        (item) => item.name === currentPage
                      ) && item.type === "title"
                ) === -1
                  ? settingsConfig.length
                  : settingsConfig.findIndex(
                      (item, index) =>
                        index >
                          settingsConfig.findIndex(
                            (item) => item.name === currentPage
                          ) && item.type === "title"
                    )
              )
              .map((item) =>
                item.key === "customTexts" ? (
                  <CustomTextsEditor
                    key={item.key}
                    value={editingConfig.customTexts || ""}
                    onChange={(value) =>
                      handleConfigChange("customTexts", value)
                    }
                    page={customTextsPage}
                    onPageChange={setCustomTextsPage}
                  />
                ) : (
                  <SettingItem
                    key={item.key || item.name}
                    item={item}
                    editingConfig={editingConfig}
                    onConfigChange={handleConfigChange}
                  />
                )
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
