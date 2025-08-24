import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatBytes,
  formatUptime,
  getOSImage,
  formatTrafficLimit,
} from "@/utils";
import type { NodeWithStatus } from "@/types/node";
import { Link } from "react-router-dom";
import { CpuIcon, MemoryStickIcon, HardDriveIcon } from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { ProgressBar } from "../ui/progress-bar";
import { CircleProgress } from "../ui/circle-progress";

interface NodeCardProps {
  node: NodeWithStatus;
}

export const NodeCard = ({ node }: NodeCardProps) => {
  const {
    stats,
    isOnline,
    tagList,
    cpuUsage,
    memUsage,
    swapUsage,
    diskUsage,
    load,
    expired_at,
    trafficPercentage,
  } = useNodeCommons(node);

  const getProgressBarClass = (percentage: number) => {
    if (percentage > 90) return "bg-red-600";
    if (percentage > 50) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <Card
      className={`flex flex-col mx-auto bg-card backdrop-blur-xs w-full min-w-[280px] max-w-sm ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link to={`/instance/${node.uuid}`}>
          <div className="flex items-center gap-2">
            <Flag flag={node.region}></Flag>
            <img
              src={getOSImage(node.os)}
              alt={node.os}
              className="w-6 h-6 rounded-full"
              loading="lazy"
            />
            <CardTitle className="text-base font-bold">{node.name}</CardTitle>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-nowrap">
        <div className="flex flex-wrap gap-1">
          <Tag tags={tagList} />
        </div>
        <div className="border-t border-border/60 my-2"></div>
        <div className="flex items-center justify-around whitespace-nowrap">
          <div className="flex items-center gap-1">
            <CpuIcon className="size-4 text-blue-600 flex-shrink-0" />
            <span className="text-secondary-foreground">
              {node.cpu_cores} Cores
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MemoryStickIcon className="size-4 text-green-600 flex-shrink-0" />
            <span className="text-secondary-foreground">
              {formatBytes(node.mem_total)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <HardDriveIcon className="size-4 text-red-600 flex-shrink-0" />
            <span className="text-secondary-foreground">
              {formatBytes(node.disk_total)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary-foreground">CPU</span>
          <div className="w-3/4 flex items-center gap-2">
            <ProgressBar
              value={cpuUsage}
              className={getProgressBarClass(cpuUsage)}
            />
            <span className="w-12 text-right">{cpuUsage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary-foreground">内存</span>
          <div className="w-3/4 flex items-center gap-2">
            <ProgressBar
              value={memUsage}
              className={getProgressBarClass(memUsage)}
            />
            <span className="w-12 text-right">{memUsage.toFixed(0)}%</span>
          </div>
        </div>
        {node.swap_total > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-secondary-foreground">SWAP</span>
            <div className="w-3/4 flex items-center gap-2">
              <ProgressBar
                value={swapUsage}
                className={getProgressBarClass(swapUsage)}
              />
              <span className="w-12 text-right">{swapUsage.toFixed(0)}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-secondary-foreground">SWAP</span>
            <div className="w-3/4 flex items-center gap-2">
              <ProgressBar value={0} />
              <span className="w-12 text-right">OFF</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-secondary-foreground">硬盘</span>
          <div className="w-3/4 flex items-center gap-2">
            <ProgressBar
              value={diskUsage}
              className={getProgressBarClass(diskUsage)}
            />
            <span className="w-12 text-right">{diskUsage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="border-t border-border/60 my-2"></div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary-foreground">网络：</span>
          <div>
            <span>↑ {stats ? formatBytes(stats.network.up, true) : "N/A"}</span>
            <span className="ml-2">
              ↓ {stats ? formatBytes(stats.network.down, true) : "N/A"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary-foreground w-1/5">流量</span>
          <div className="flex items-center justify-between w-4/5">
            <div className="flex items-center w-1/4">
              {node.traffic_limit !== 0 && isOnline && stats && (
                <CircleProgress
                  value={trafficPercentage}
                  maxValue={100}
                  size={32}
                  strokeWidth={4}
                  showPercentage={true}
                />
              )}
            </div>
            <div className="w-3/4 text-right">
              <div>
                <span>
                  ↑ {stats ? formatBytes(stats.network.totalUp) : "N/A"}
                </span>
                <span className="ml-2">
                  ↓ {stats ? formatBytes(stats.network.totalDown) : "N/A"}
                </span>
              </div>
              {node.traffic_limit !== 0 && isOnline && stats && (
                <div className="text-right">
                  {formatTrafficLimit(
                    node.traffic_limit,
                    node.traffic_limit_type
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary-foreground">负载</span>
          <span>{load}</span>
        </div>
        <div className="flex justify-between text-xs">
          <div className="flex justify-start w-full">
            <span className="text-secondary-foreground">到期：</span>
            <div className="flex items-center gap-1">{expired_at}</div>
          </div>
          <div className="border-l border-border/60 mx-2"></div>
          <div className="flex justify-end w-full">
            <span className="text-secondary-foreground">在线：</span>
            <span>
              {isOnline && stats ? formatUptime(stats.uptime) : "离线"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
