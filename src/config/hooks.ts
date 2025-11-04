import { useContext, useCallback } from "react";
import { ConfigContext } from "./ConfigContext";
import type { ConfigContextType } from "./ConfigContext";
import { DEFAULT_CONFIG } from "./default";
import { defaultTexts, otherTexts } from "./locales";

/**
 * 安全地获取嵌套对象的属性
 * @param obj 要查询的对象
 * @param path 属性路径
 * @param defaultValue 如果解析值为 undefined，则返回此值
 * @returns 解析后的值
 */
const get = (obj: any, path: string, defaultValue: any = undefined) => {
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }
  return result;
};

type Paths<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? Paths<T[K], `${P}${Exclude<K, symbol>}.`>
        : `${P}${Exclude<K, symbol>}`;
    }[keyof T]
  : never;

type MergedTexts = typeof defaultTexts & typeof otherTexts;
type LocaleKeys = Paths<MergedTexts>;

/**
 * 使用全局配置 Hook，用于获取当前应用配置
 * @returns 配置对象（合并了默认配置，确保所有属性都有值）
 */
export function useAppConfig(): ConfigContextType {
  const config = useContext(ConfigContext);
  return { ...DEFAULT_CONFIG, ...config };
}

/**
 * 使用本地化文本 Hook
 * @returns 一个 t 函数，用于获取文本
 */
export function useLocale() {
  const { texts } = useAppConfig();

  const t = useCallback(
    (key: LocaleKeys, params?: Record<string, string | number>): string => {
      const text = get(texts, key, key);

      if (typeof text !== "string") {
        return key as string;
      }

      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(
            new RegExp(`{${paramKey}}`, "g"),
            String(paramValue)
          );
        }, text);
      }

      return text;
    },
    [texts]
  );

  return { t };
}
