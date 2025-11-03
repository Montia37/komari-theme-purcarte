import { useEffect, useState, useRef, useCallback } from "react";
import { useAppConfig } from "@/config/hooks";
import type { ConfigOptions } from "@/config/default";
import { DEFAULT_CONFIG } from "@/config/default";
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
  const texts = {
    title: "编辑配置",
    customUI: "UI 自定义",
    close: "关闭",
    import: "导入",
    export: "导出",
    togglePreview: {
      on: "关闭预览",
      off: "开启预览",
    },
    reset: "重置",
    save: "保存",
    back: "返回",
    unsavedChanges: "有未保存的更改",
    unsavedChangesDesc: "配置已恢复到上次保存的状态",
    saveSuccess: "配置已保存！",
    saveError: "保存配置失败！",
    resetConfirm: "确定要重置所有配置吗？",
    resetConfirmAction: "确定",
    importSuccess: "导入成功，是否立即保存？",
    importError: "导入配置失败！",
    fetchError: "Failed to fetch theme settings config:",
    saveThemeError: "Failed to save theme settings:",
    importConfigError: "Failed to import config:",
    cancel: "撤销",
  };

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
          console.error(texts.fetchError, error);
        }
      }
    };

    fetchSettingsConfig();
  }, [publicSettings?.theme, texts.fetchError]);

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
      toast.success(texts.saveSuccess);
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
      await reloadConfig();
      onClose();
    } catch (error) {
      console.error(texts.saveThemeError, error);
      toast.error(texts.saveError);
    }
  }, [
    editingConfig,
    onClose,
    publicSettings,
    reloadConfig,
    texts.saveError,
    texts.saveSuccess,
    texts.saveThemeError,
  ]);

  const handleReset = () => {
    toast(texts.resetConfirm, {
      action: {
        label: texts.resetConfirmAction,
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
      toastId.current = toast(texts.unsavedChanges, {
        duration: Infinity,
        action: {
          label: texts.save,
          onClick: () => handleSave(),
        },
        cancel: {
          label: texts.cancel,
          onClick: () => {
            reloadConfig();
            toast.success(texts.unsavedChangesDesc);
          },
        },
      });
    } else if (!hasUnsavedChanges && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [
    handleSave,
    hasUnsavedChanges,
    reloadConfig,
    texts.cancel,
    texts.save,
    texts.unsavedChanges,
    texts.unsavedChangesDesc,
  ]);

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
          toast.success(texts.importSuccess, {
            action: {
              label: texts.save,
              onClick: () => setTimeout(() => handleSave(), 300),
            },
          });
        } catch (error) {
          console.error(texts.importConfigError, error);
          toast.error(texts.importError);
        }
      };
      reader.readAsText(file);
    }
  };

  const panelClasses = isMobile
    ? "fixed bottom-0 left-0 w-full h-3/4 bg-gray-100/90 dark:bg-gray-900/90 theme-card-style shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
    : "h-screen w-80 bg-gray-100/90 dark:bg-gray-900/90 theme-card-style shadow-lg p-4 overflow-y-auto flex-shrink-0";

  if (!isOpen) return null;

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{texts.title}</h2>
        <Button
          onClick={() => {
            if (isPreviewing) {
              updatePreviewConfig({});
            }
            onClose();
          }}
          variant="ghost">
          {texts.close}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button asChild>
          <label htmlFor="import-config">
            {texts.import}
            <input
              id="import-config"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </Button>
        <Button onClick={handleExport}>{texts.export}</Button>
        <Button onClick={handlePreviewToggle}>
          {isPreviewing ? texts.togglePreview.on : texts.togglePreview.off}
        </Button>
        <Button onClick={handleReset}>{texts.reset}</Button>
        <Button onClick={handleSave} className="bg-green-500">
          {texts.save}
        </Button>
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
            {currentPage === texts.customUI &&
            customTextsPage !== "main" ? null : (
              <Button onClick={() => setCurrentPage("main")} className="mb-4">
                {texts.back}
              </Button>
            )}
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
