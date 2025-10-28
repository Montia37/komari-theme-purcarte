import { formatBytes, formatTrafficLimit, formatUptime } from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import {
  CpuIcon,
  MemoryStickIcon,
  HardDriveIcon,
  ChevronRight,
} from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { CircleProgress } from "../ui/progress-circle";
import { ProgressBar } from "../ui/progress-bar";
import { useState, useEffect } from "react";
import Instance from "@/pages/instance/Instance";
import PingChart from "@/pages/instance/PingChart";
import { useAppConfig } from "@/config";
import { useLocale } from "@/config/hooks";
import { Card } from "../ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeTableProps {
  nodes: NodeData[];
  enableSwap: boolean;
  enableListItemProgressBar: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
}

export const NodeTable = ({
  nodes,
  enableSwap,
  enableListItemProgressBar,
  selectTrafficProgressStyle,
}: NodeTableProps) => {
  const { t } = useLocale();
  const gridCols = enableSwap ? "grid-cols-9" : "grid-cols-8";

  return (
    <ScrollArea className="w-full" showHorizontalScrollbar>
      <div className="min-w-[1080px] px-2 pb-2">
        <div className="space-y-1">
          <Card>
            <div
              className={`bg-card theme-card-style text-primary font-bold grid ${gridCols} text-center gap-4 p-2 items-center transition-colors duration-200`}>
              <div className="col-span-2">{t("node.name")}</div>
              <div className="col-span-1">{t("node.cpu")}</div>
              <div className="col-span-1">{t("node.mem")}</div>
              {enableSwap && <div className="col-span-1">{t("node.swap")}</div>}
              <div className="col-span-1">{t("node.disk")}</div>
              <div className="col-span-1">{t("node.network")}</div>
              <div className="col-span-1">{t("node.traffic")}</div>
              <div className="col-span-1">{t("node.load")}</div>
            </div>
          </Card>
          {nodes.map((node) => (
            <NodeTableRow
              key={node.uuid}
              node={node}
              enableSwap={enableSwap}
              enableListItemProgressBar={enableListItemProgressBar}
              selectTrafficProgressStyle={selectTrafficProgressStyle}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

interface NodeTableRowProps {
  node: NodeData;
  enableSwap: boolean;
  enableListItemProgressBar: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
}

const NodeTableRow = ({
  node,
  enableSwap,
  enableListItemProgressBar,
  selectTrafficProgressStyle,
}: NodeTableRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderChart, setShouldRenderChart] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRenderChart(true);
    }
  }, [isOpen]);

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
  const gridCols = enableSwap ? "grid-cols-9" : "grid-cols-8";
  const { pingChartTimeInPreview } = useAppConfig();
  const { t } = useLocale();

  return (
    <Card>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`grid ${gridCols} text-center gap-4 p-2 text-nowrap items-center ${
          isOnline
            ? ""
            : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
        } text-primary transition-colors duration-200 cursor-pointer`}>
        <div className="col-span-2 flex items-center text-left">
          <ChevronRight
            className={`transition-transform size-5 duration-300 flex-shrink-0 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          <Flag flag={node.region} />
          <div className="ml-2 w-[85%] space-y-1">
            <Link
              to={`/instance/${node.uuid}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:text-(--accent-11)">
              <div className="text-base font-bold">{node.name}</div>
            </Link>
            <Tag className="text-xs" tags={tagList} />
            <div className="flex text-xs">
              <span>
                {isOnline && stats
                  ? `${expired_at} | ${formatUptime(stats.uptime)}`
                  : t("node.offline")}
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex items-center text-left">
          <CpuIcon className="inline-block size-5 flex-shrink-0 text-blue-600" />
          <div className="ml-1 w-full items-center justify-center">
            <div>
              {node.cpu_cores} {t("node.cores")}
            </div>
            {enableListItemProgressBar ? (
              <div className="flex items-center gap-1">
                <ProgressBar value={cpuUsage} h="h-2" />
                <span className="w-10 text-right text-xs">
                  {isOnline
                    ? `${cpuUsage.toFixed(0)}%`
                    : t("node.notAvailable")}
                </span>
              </div>
            ) : (
              <div>
                {isOnline ? `${cpuUsage.toFixed(0)}%` : t("node.notAvailable")}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-1 flex items-center text-left">
          <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-green-600" />
          <div className="ml-1 w-full items-center justify-center">
            <div>{formatBytes(node.mem_total)}</div>
            {enableListItemProgressBar ? (
              <div className="flex items-center gap-1">
                <ProgressBar value={memUsage} h="h-2" />
                <span className="w-10 text-right text-xs">
                  {isOnline
                    ? `${memUsage.toFixed(0)}%`
                    : t("node.notAvailable")}
                </span>
              </div>
            ) : (
              <div>
                {isOnline ? `${memUsage.toFixed(0)}%` : t("node.notAvailable")}
              </div>
            )}
          </div>
        </div>
        {enableSwap && (
          <div className="col-span-1 flex items-center text-left">
            <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-purple-600" />
            {node.swap_total > 0 ? (
              <div className="ml-1 w-full items-center justify-center">
                <div>{formatBytes(node.swap_total)}</div>
                {enableListItemProgressBar ? (
                  <div className="flex items-center gap-1">
                    <ProgressBar value={swapUsage} h="h-2" />
                    <span className="w-10 text-right text-xs">
                      {isOnline
                        ? `${swapUsage.toFixed(0)}%`
                        : t("node.notAvailable")}
                    </span>
                  </div>
                ) : (
                  <div>
                    {isOnline
                      ? `${swapUsage.toFixed(0)}%`
                      : t("node.notAvailable")}
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 w-full item-center justify-center">
                {t("node.off")}
              </div>
            )}
          </div>
        )}
        <div className="col-span-1 flex items-center text-left">
          <HardDriveIcon className="inline-block size-5 flex-shrink-0 text-red-600" />
          <div className="ml-1 w-full items-center justify-center">
            <div>{formatBytes(node.disk_total)}</div>
            {enableListItemProgressBar ? (
              <div className="flex items-center gap-1">
                <ProgressBar value={diskUsage} h="h-2" />
                <span className="w-10 text-right text-xs">
                  {isOnline
                    ? `${diskUsage.toFixed(0)}%`
                    : t("node.notAvailable")}
                </span>
              </div>
            ) : (
              <div>
                {isOnline ? `${diskUsage.toFixed(0)}%` : t("node.notAvailable")}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-1 text-left">
          <div>
            {t("node.uploadPrefix")}{" "}
            {stats ? formatBytes(stats.net_out, true) : t("node.notAvailable")}
          </div>
          <div>
            {t("node.downloadPrefix")}{" "}
            {stats ? formatBytes(stats.net_in, true) : t("node.notAvailable")}
          </div>
        </div>
        <div className="col-span-1 text-left">
          {selectTrafficProgressStyle === "linear" && isOnline && stats ? (
            <div className="flex flex-col">
              <div>
                <div>
                  {t("node.uploadPrefix")}{" "}
                  {stats
                    ? formatBytes(stats.net_total_up)
                    : t("node.notAvailable")}
                </div>
                <div>
                  {t("node.downloadPrefix")}{" "}
                  {stats
                    ? formatBytes(stats.net_total_down)
                    : t("node.notAvailable")}
                </div>
              </div>
              {node.traffic_limit !== 0 && isOnline && stats && (
                <>
                  <div className="w-[80%] flex items-center gap-1">
                    <ProgressBar value={trafficPercentage} h="h-2" />
                    <span className="text-right text-xs">
                      {node.traffic_limit !== 0
                        ? `${trafficPercentage.toFixed(0)}%`
                        : ""}
                    </span>
                  </div>
                  <div className="text-xs text-secondary-foreground">
                    {formatTrafficLimit(
                      node.traffic_limit,
                      node.traffic_limit_type
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div>
                  <div>
                    {t("node.uploadPrefix")}{" "}
                    {stats
                      ? formatBytes(stats.net_total_up)
                      : t("node.notAvailable")}
                  </div>
                  <div>
                    {t("node.downloadPrefix")}{" "}
                    {stats
                      ? formatBytes(stats.net_total_down)
                      : t("node.notAvailable")}
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
              {node.traffic_limit !== 0 && isOnline && stats && (
                <div>
                  <CircleProgress
                    value={trafficPercentage}
                    maxValue={100}
                    size={32}
                    strokeWidth={4}
                    showPercentage={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="col-span-1">
          {load.split("|").map((item, index) => (
            <div key={index}>{item.trim()}</div>
          ))}
        </div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
        onTransitionEnd={() => {
          if (!isOpen) {
            setShouldRenderChart(false);
          }
        }}>
        <div className="grid grid-cols-3 gap-4 p-2">
          <div className="col-span-1 @container">
            <Instance node={node} />
          </div>
          <div className="col-span-2">
            {shouldRenderChart && (
              <PingChart node={node} hours={pingChartTimeInPreview} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
