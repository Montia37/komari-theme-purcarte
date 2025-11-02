import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatBytes,
  formatUptime,
  getOSImage,
  formatTrafficLimit,
} from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import { CpuIcon, MemoryStickIcon, HardDriveIcon, Info, X } from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { ProgressBar } from "../ui/progress-bar";
import { CircleProgress } from "../ui/progress-circle";
import { useAppConfig } from "@/config";
import { useState, useEffect } from "react";
import Instance from "@/pages/instance/Instance";
import PingChart from "@/pages/instance/PingChart";
import { useLocale } from "@/config/hooks";

interface NodeDetailModalProps {
  node: NodeData;
  onClose: () => void;
}

const NodeDetailModal = ({ node, onClose }: NodeDetailModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const { pingChartTimeInPreview } = useAppConfig();
  const { t } = useLocale();

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}>
      <div
        className={`purcarte-blur theme-card-style p-5 w-full max-w-4xl max-h-[80vh] transition-transform duration-300 ${
          isOpen && !isClosing ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2 h-full">
          <h2 className="text-xl font-bold">
            {t("node.details", { name: node.name })}
          </h2>
          <button onClick={handleClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <ScrollArea
          className="h-[calc(80vh-100px)]"
          viewportProps={{ className: "p-2" }}>
          <div className="space-y-4 @container">
            <Instance node={node} />
            <PingChart node={node} hours={pingChartTimeInPreview} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

interface NodeGridContainerProps {
  nodes: NodeData[];
  enableSwap: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
}

export const NodeGridContainer = ({
  nodes,
  enableSwap,
  selectTrafficProgressStyle,
}: NodeGridContainerProps) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  return (
    <>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}>
        {nodes.map((node) => (
          <NodeGrid
            key={node.uuid}
            node={node}
            enableSwap={enableSwap}
            selectTrafficProgressStyle={selectTrafficProgressStyle}
            onShowDetails={() => setSelectedNode(node)}
          />
        ))}
      </div>
      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </>
  );
};

interface NodeGridProps {
  node: NodeData;
  enableSwap: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
  onShowDetails: () => void;
}

export const NodeGrid = ({
  node,
  enableSwap,
  selectTrafficProgressStyle,
  onShowDetails,
}: NodeGridProps) => {
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
  const { isShowHWBarInCard, isShowValueUnderProgressBar } = useAppConfig();
  const { t } = useLocale();

  return (
    <Card
      className={`flex flex-col mx-auto w-full min-w-[280px] max-w-sm ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link
          to={`/instance/${node.uuid}`}
          className="hover:underline hover:text-(--accent-11)">
          <div className="flex items-center gap-2">
            <Flag flag={node.region}></Flag>
            <img
              src={getOSImage(node.os)}
              alt={node.os}
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
            <CardTitle className="text-base font-bold">{node.name}</CardTitle>
          </div>
        </Link>
        <button onClick={onShowDetails}>
          <Info className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-nowrap">
        <div className="flex flex-wrap gap-1 mb-2">
          <Tag tags={tagList} />
        </div>
        <div className="border-t border-(--accent-4)/50 my-2"></div>
        {isShowHWBarInCard && (
          <div className="flex items-center justify-around whitespace-nowrap">
            <div className="flex items-center gap-1">
              <CpuIcon className="size-4 text-blue-600 flex-shrink-0" />
              <span>
                {node.cpu_cores} {t("node.cores")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MemoryStickIcon className="size-4 text-green-600 flex-shrink-0" />
              <span>{formatBytes(node.mem_total)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDriveIcon className="size-4 text-red-600 flex-shrink-0" />
              <span>{formatBytes(node.disk_total)}</span>
            </div>
          </div>
        )}
        <div className={`${isShowValueUnderProgressBar ? "mb-1" : ""}`}>
          <div className="flex items-center justify-between">
            <span>{t("node.cpu")}</span>
            <div className="w-3/4 flex items-center gap-2">
              <ProgressBar value={cpuUsage} />
              <span className="w-12 text-right">{cpuUsage.toFixed(0)}%</span>
            </div>
          </div>
          {isShowValueUnderProgressBar && (
            <div className="flex text-xs items-center justify-between text-secondary-foreground">
              <span>
                {node.cpu_cores} {t("node.cores")}
              </span>
            </div>
          )}
        </div>
        <div className={`${isShowValueUnderProgressBar ? "mb-1" : ""}`}>
          <div className="flex items-center justify-between">
            <span>{t("node.mem")}</span>
            <div className="w-3/4 flex items-center gap-2">
              <ProgressBar value={memUsage} />
              <span className="w-12 text-right">{memUsage.toFixed(0)}%</span>
            </div>
          </div>
          {isShowValueUnderProgressBar && (
            <div className="flex text-xs items-center justify-between text-secondary-foreground">
              <span>
                {node.mem_total > 0
                  ? `${formatBytes(node.mem_total)}`
                  : t("node.notAvailable")}
              </span>
              <span>
                {stats ? `${formatBytes(stats.ram)}` : t("node.notAvailable")}
              </span>
            </div>
          )}
        </div>
        {enableSwap && (
          <div className={`${isShowValueUnderProgressBar ? "mb-1" : ""}`}>
            <div className="flex items-center justify-between">
              <span>{t("node.swap")}</span>
              <div className="w-3/4 flex items-center gap-2">
                <ProgressBar value={swapUsage} />
                {node.swap_total > 0 ? (
                  <span className="w-12 text-right">
                    {swapUsage.toFixed(0)}%
                  </span>
                ) : (
                  <span className="w-12 text-right">{t("node.off")}</span>
                )}
              </div>
            </div>
            {isShowValueUnderProgressBar && (
              <div className="flex text-xs items-center justify-between text-secondary-foreground">
                <span>
                  {node.swap_total > 0
                    ? `${formatBytes(node.swap_total)}`
                    : t("node.notEnabled")}
                </span>
                <span>
                  {stats
                    ? `${formatBytes(stats.swap)}`
                    : t("node.notAvailable")}
                </span>
              </div>
            )}
          </div>
        )}
        <div className={`${isShowValueUnderProgressBar ? "mb-1" : ""}`}>
          <div className="flex items-center justify-between">
            <span>{t("node.disk")}</span>
            <div className="w-3/4 flex items-center gap-2">
              <ProgressBar value={diskUsage} />
              <span className="w-12 text-right">{diskUsage.toFixed(0)}%</span>
            </div>
          </div>
          {isShowValueUnderProgressBar && (
            <div className="flex text-xs items-center justify-between text-secondary-foreground">
              <span>
                {node.disk_total > 0
                  ? `${formatBytes(node.disk_total)}`
                  : t("node.notAvailable")}
              </span>
              <span>
                {stats ? `${formatBytes(stats.disk)}` : t("node.notAvailable")}
              </span>
            </div>
          )}
        </div>
        {selectTrafficProgressStyle === "linear" && stats && (
          <div className="mb-1">
            <div className="flex items-center justify-between">
              <span>{t("node.traffic")}</span>
              <div className="w-3/4 flex items-center gap-2">
                <ProgressBar value={trafficPercentage} />
                <span className="w-12 text-right">
                  {node.traffic_limit !== 0
                    ? `${trafficPercentage.toFixed(0)}%`
                    : t("node.off")}
                </span>
              </div>
            </div>
            <div className="flex text-xs items-center justify-between text-secondary-foreground">
              <span>
                {formatTrafficLimit(
                  node.traffic_limit,
                  node.traffic_limit_type
                )}
              </span>
              <span>
                {stats
                  ? `${t("node.uploadPrefix")} ${formatBytes(
                      stats.net_total_up
                    )} ${t("node.downloadPrefix")} ${formatBytes(
                      stats.net_total_down
                    )}`
                  : t("node.notAvailable")}
              </span>
            </div>
          </div>
        )}
        <div className="border-t border-(--accent-4)/50 my-2"></div>
        <div className="flex justify-between text-xs">
          <span>{t("node.network")}</span>
          <div>
            <span>
              {t("node.uploadPrefix")}{" "}
              {stats
                ? formatBytes(stats.net_out, true)
                : t("node.notAvailable")}
            </span>
            <span className="ml-2">
              {t("node.downloadPrefix")}{" "}
              {stats ? formatBytes(stats.net_in, true) : t("node.notAvailable")}
            </span>
          </div>
        </div>
        {selectTrafficProgressStyle === "circular" && stats && (
          <div className="flex items-center justify-between text-xs">
            <span className="w-1/5">{t("node.traffic")}</span>
            <div className="flex items-center justify-between w-4/5">
              <div className="flex items-center w-1/4">
                {node.traffic_limit !== 0 && (
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
                    {t("node.uploadPrefix")}{" "}
                    {stats
                      ? formatBytes(stats.net_total_up)
                      : t("node.notAvailable")}
                  </span>
                  <span className="ml-2">
                    {t("node.downloadPrefix")}{" "}
                    {stats
                      ? formatBytes(stats.net_total_down)
                      : t("node.notAvailable")}
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
        )}
        <div className="flex justify-between text-xs">
          <span>{t("node.load")}</span>
          <span>{load}</span>
        </div>
        <div className="flex justify-between text-xs">
          <div className="flex justify-start w-full">
            <span className="mr-1">{t("node.expiredAt")}</span>
            <span>{expired_at}</span>
          </div>
          <div className="border-l border-(--accent-4)/50 mx-2"></div>
          <div className="flex justify-end w-full">
            <span>
              {isOnline && stats ? (
                <>
                  <span className="mr-1">{t("node.uptime")}</span>
                  <span>{formatUptime(stats.uptime)}</span>
                </>
              ) : (
                t("node.offline")
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
