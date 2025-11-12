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
  const { publicSettings, themeSettings, updatePreviewConfig } = config;
  const settingsConfig = useRef<any[]>([]);
  const [editingConfig, setEditingConfig] =
    useState<Partial<ConfigOptions>>(themeSettings);
  const [currentPage, setCurrentPage] = useState("main");
  const [customTextsPage, setCustomTextsPage] = useState("main");
  const [isPreviewing, setIsPreviewing] = useState(true);
  const isMobile = useIsMobile();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const toastId = useRef<string | number | null>(null);

  const themeName = publicSettings.theme;

  useEffect(() => {
    const fetchSettingsConfig = async () => {
      try {
        const response = await fetch(`/themes/${themeName}/komari-theme.json`);
        const data = await response.json();
        settingsConfig.current = data.configuration.data;
      } catch (error) {
        console.error(t("setting.fetchError"), error);
      }
    };

    fetchSettingsConfig();
  }, [t, themeName]);

  useEffect(() => {
    if (JSON.stringify(editingConfig) !== JSON.stringify(themeSettings)) {
      updatePreviewConfig(editingConfig);
    }
    const hasChanges =
      JSON.stringify(editingConfig) !== JSON.stringify(themeSettings);
    setHasUnsavedChanges(hasChanges);
  }, [editingConfig, themeSettings, updatePreviewConfig]);

  useEffect(() => {
    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  const handleConfigChange = (key: keyof ConfigOptions, value: any) => {
    if (editingConfig[key] !== value) {
      const newConfig = { ...editingConfig, [key]: value };
      setEditingConfig(newConfig);
      if (isPreviewing) {
        updatePreviewConfig(newConfig);
      }
    }
  };

  const resetSettings = useCallback(() => {
    setEditingConfig(themeSettings);
    updatePreviewConfig(themeSettings);
  }, [themeSettings, updatePreviewConfig]);

  const handleSave = useCallback(async () => {
    try {
      const { status } = await apiService.saveThemeSettings(
        themeName,
        editingConfig
      );
      if (status === "error") {
        toast.error(t("setting.saveError"));
      } else {
        toast.success(t("setting.saveSuccess"));
      }
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    } catch (error) {
      console.error(t("setting.saveThemeError"), error);
      toast.error(t("setting.saveError"));
    }
  }, [themeName, editingConfig, t]);

  const handleReset = () => {
    toast(t("setting.resetConfirm"), {
      action: {
        label: t("setting.resetConfirmAction"),
        onClick: () => {
          setEditingConfig(themeSettings);
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
            resetSettings();
            toast.success(t("setting.unsavedChangesDesc"));
          },
        },
      });
    } else if (!hasUnsavedChanges && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [hasUnsavedChanges, resetSettings, t, themeSettings]);

  const handlePreviewToggle = () => {
    if (isPreviewing) {
      updatePreviewConfig(themeSettings);
      setIsPreviewing(false);
    } else {
      updatePreviewConfig(editingConfig);
      setIsPreviewing(true);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(themeSettings, null, 2));
    const downloadAnchorNode = document.createElement("a");
    const date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "_")
      .replace(/:/g, "-");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `komari-theme-config-${date}.json`
    );
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
              updatePreviewConfig(themeSettings);
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
          settingsConfig.current
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
            {settingsConfig.current
              .slice(
                settingsConfig.current.findIndex(
                  (item) => item.name === currentPage
                ) + 1,
                settingsConfig.current.findIndex(
                  (item, index) =>
                    index >
                      settingsConfig.current.findIndex(
                        (item) => item.name === currentPage
                      ) && item.type === "title"
                ) === -1
                  ? settingsConfig.current.length
                  : settingsConfig.current.findIndex(
                      (item, index) =>
                        index >
                          settingsConfig.current.findIndex(
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
