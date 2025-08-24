import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to format bytes
export const formatBytes = (bytes: number, isSpeed = false, decimals = 2) => {
  if (bytes === 0) return isSpeed ? "0 B/s" : "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = isSpeed
    ? ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"]
    : ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

  let i = Math.floor(Math.log(bytes) / Math.log(k));
  let value = bytes / Math.pow(k, i);

  // 如果值大于等于1000，则进位到下一个单位
  if (value >= 1000 && i < sizes.length - 1) {
    i++;
    value = bytes / Math.pow(k, i);
  }

  return parseFloat(value.toFixed(dm)) + " " + sizes[i];
};

// Helper function to format uptime
export const formatUptime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return "N/A";
  }
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  const mns = Math.floor(seconds / 60);

  let uptimeString = "";
  if (days > 0) {
    uptimeString += `${days}天`;
  }
  if (hrs > 0) {
    uptimeString += `${hrs}小时`;
  }
  if (mns > 0 && days === 0) {
    // Only show minutes if uptime is less than a day
    uptimeString += `${mns}分钟`;
  }
  if (uptimeString === "") {
    return "刚刚";
  }

  return uptimeString;
};

export const formatPrice = (
  price: number,
  currency: string,
  billingCycle: number
) => {
  if (price === -1) return "免费";
  if (price === 0) return "";
  if (!currency || !billingCycle) return "N/A";

  let cycleStr = `${billingCycle}天`;
  if (billingCycle < 0) {
    return `${currency}${price.toFixed(2)}`;
  } else if (billingCycle === 30 || billingCycle === 31) {
    cycleStr = "月";
  } else if (billingCycle >= 89 && billingCycle <= 92) {
    cycleStr = "季";
  } else if (billingCycle >= 180 && billingCycle <= 183) {
    cycleStr = "半年";
  } else if (billingCycle >= 364 && billingCycle <= 366) {
    cycleStr = "年";
  } else if (billingCycle >= 730 && billingCycle <= 732) {
    cycleStr = "两年";
  } else if (billingCycle >= 1095 && billingCycle <= 1097) {
    cycleStr = "三年";
  } else if (billingCycle >= 1825 && billingCycle <= 1827) {
    cycleStr = "五年";
  }

  return `${currency}${price.toFixed(2)}/${cycleStr}`;
};

export const formatTrafficLimit = (
  limit?: number,
  type?: "sum" | "max" | "min" | "up" | "down"
) => {
  if (!limit) return "未设置";

  const limitText = formatBytes(limit);

  const typeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[type || "max"] || "";

  return `总 ${limitText} (${typeText})`;
};
