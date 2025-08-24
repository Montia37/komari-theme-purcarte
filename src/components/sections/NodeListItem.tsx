import { formatBytes, formatTrafficLimit, formatUptime } from "@/utils";
import type { NodeWithStatus } from "@/types/node";
import { Link } from "react-router-dom";
import { CpuIcon, MemoryStickIcon, HardDriveIcon } from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { CircleProgress } from "../ui/circle-progress";

interface NodeListItemProps {
  node: NodeWithStatus;
  enableSwap: boolean | undefined;
}

export const NodeListItem = ({ node, enableSwap }: NodeListItemProps) => {
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

  const gridCols = enableSwap ? "grid-cols-10" : "grid-cols-9";

  return (
    <div
      className={`grid ${gridCols} text-center shadow-md gap-4 p-2 text-nowrap items-center rounded-lg ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      } text-secondary-foreground transition-colors duration-200`}>
      <div className="col-span-2 flex items-center text-left">
        <Flag flag={node.region} />
        <Link to={`/instance/${node.uuid}`}>
          <div className="ml-2 w-full">
            <div className="text-base font-bold">{node.name}</div>
            <Tag className="text-xs" tags={tagList} />
            <div className="flex text-xs">
              <span className="text-secondary-foreground">到期：</span>
              <div className="flex items-center gap-1">{expired_at}</div>
            </div>
            <div className="flex text-xs">
              <span className="text-secondary-foreground">在线：</span>
              <span>
                {isOnline && stats ? formatUptime(stats.uptime) : "离线"}
              </span>
            </div>
          </div>
        </Link>
      </div>
      <div className="col-span-1 flex items-center text-left">
        <CpuIcon className="inline-block size-5 flex-shrink-0 text-blue-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{node.cpu_cores} Cores</div>
          <div>{isOnline ? `${cpuUsage.toFixed(1)}%` : "N/A"}</div>
        </div>
      </div>
      <div className="col-span-1 flex items-center text-left">
        <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-green-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{formatBytes(node.mem_total)}</div>
          <div className="mt-1">
            {isOnline ? `${memUsage.toFixed(1)}%` : "N/A"}
          </div>
        </div>
      </div>
      {enableSwap && (
        <div className="col-span-1 flex items-center text-left">
          <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-purple-600" />
          {node.swap_total > 0 ? (
            <div className="ml-1 w-full items-center justify-center">
              <div>{formatBytes(node.swap_total)}</div>
              <div className="mt-1">
                {isOnline ? `${swapUsage.toFixed(1)}%` : "N/A"}
              </div>
            </div>
          ) : (
            <div className="ml-1 w-full item-center justify-center">OFF</div>
          )}
        </div>
      )}
      <div className="col-span-1 flex items-center text-left">
        <HardDriveIcon className="inline-block size-5 flex-shrink-0 text-red-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{formatBytes(node.disk_total)}</div>
          <div className="mt-1">
            {isOnline ? `${diskUsage.toFixed(1)}%` : "N/A"}
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <div>↑ {stats ? formatBytes(stats.network.up, true) : "N/A"}</div>
        <div>↓ {stats ? formatBytes(stats.network.down, true) : "N/A"}</div>
      </div>
      <div className="col-span-2">
        <div className="flex items-center justify-around">
          {node.traffic_limit !== 0 && isOnline && stats && (
            <div className="flex items-center justify-center w-1/3">
              <CircleProgress
                value={trafficPercentage}
                maxValue={100}
                size={32}
                strokeWidth={4}
                showPercentage={true}
              />
            </div>
          )}
          <div
            className={node.traffic_limit !== 0 ? "w-2/3 text-left" : "w-full"}>
            <div>
              <div>↑ {stats ? formatBytes(stats.network.totalUp) : "N/A"}</div>
              <div>
                ↓ {stats ? formatBytes(stats.network.totalDown) : "N/A"}
              </div>
            </div>
            {node.traffic_limit !== 0 && isOnline && stats && (
              <div>
                {formatTrafficLimit(
                  node.traffic_limit,
                  node.traffic_limit_type
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-1">
        {load.split("|").map((item, index) => (
          <div key={index}>{item.trim()}</div>
        ))}
      </div>
    </div>
  );
};
