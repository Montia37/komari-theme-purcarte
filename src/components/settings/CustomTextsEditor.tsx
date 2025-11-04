import { useState, useEffect } from "react";
import { defaultTexts } from "@/config/locales";
import {
  flattenObject,
  parseCustomTexts,
  serializeCustomTexts,
} from "@/utils/localeUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface CustomTextsEditorProps {
  value: string;
  onChange: (value: string) => void;
  page: string;
  onPageChange: (page: string) => void;
}

const CustomTextsEditor = ({
  value,
  onChange,
  page,
  onPageChange,
}: CustomTextsEditorProps) => {
  const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});
  const flatDefaultTexts = flattenObject(defaultTexts);
  const topLevelKeys = Object.keys(defaultTexts);

  useEffect(() => {
    setEditingTexts(parseCustomTexts(value));
  }, [value]);

  const handleTextChange = (key: string, newValue: string) => {
    const newEditingTexts = { ...editingTexts };
    if (newValue === flatDefaultTexts[key]) {
      delete newEditingTexts[key];
    } else {
      newEditingTexts[key] = newValue;
    }
    setEditingTexts(newEditingTexts);
    onChange(serializeCustomTexts(newEditingTexts));
  };

  return (
    <div>
      {page === "main" ? (
        topLevelKeys.map((key) => (
          <Button
            key={key}
            onClick={() => onPageChange(key)}
            className="w-full justify-start mb-2">
            {(defaultTexts[key as keyof typeof defaultTexts] as any)?._ || key}
          </Button>
        ))
      ) : (
        <>
          {Object.keys(flatDefaultTexts)
            .filter((key) => key.startsWith(page) && !key.endsWith("._"))
            .map((key) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key}
                </label>
                <Input
                  type="text"
                  value={editingTexts[key] ?? flatDefaultTexts[key]}
                  onChange={(e) => handleTextChange(key, e.target.value)}
                  className={cn(
                    "theme-card-style",
                    editingTexts[key] ? "border-yellow-500" : ""
                  )}
                />
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default CustomTextsEditor;
