import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBytes, formatUptime, getOSImage } from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import {
  CpuIcon,
  MemoryStickIcon,
  HardDriveIcon,
  ZapIcon,
  ArrowUpDownIcon,
  GaugeIcon,
  Info,
  X,
} from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
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

  const { pingChartTimeInPreview, enableInstanceDetail, enablePingChart } =
    useAppConfig();
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
            {enableInstanceDetail && node && <Instance node={node} />}
            {enablePingChart && (
              <PingChart node={node} hours={pingChartTimeInPreview} />
            )}
            {!enableInstanceDetail && !enablePingChart && (
              <div className="flex items-center justify-center h-[calc(80vh-132px)]">
                <div className="text-lg">
                  {t("homePage.noDetailsAvailable")}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

interface NodeCompactContainerProps {
  nodes: NodeData[];
}

export const NodeCompactContainer = ({ nodes }: NodeCompactContainerProps) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  return (
    <>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}>
        {nodes.map((node) => (
          <NodeCompact
            key={node.uuid}
            node={node}
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

interface NodeCompactProps {
  node: NodeData;
  onShowDetails: () => void;
}

export const NodeCompact = ({ node, onShowDetails }: NodeCompactProps) => {
  const {
    stats,
    isOnline,
    tagList,
    cpuUsage,
    memUsage,
    diskUsage,
    load,
    expired_at,
  } = useNodeCommons(node);
  const { t } = useLocale();

  return (
    <Card
      className={`flex flex-col mx-auto w-full min-w-[280px] max-w-sm ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <Link
          to={`/instance/${node.uuid}`}
          className="hover:underline hover:text-(--accent-11)">
          <div className="flex items-center gap-2">
            <Flag flag={node.region} size={"4"}></Flag>
            <img
              src={getOSImage(node.os)}
              alt={node.os}
              className="size-4 object-contain"
              loading="lazy"
            />
            <CardTitle className="text-sm font-bold">{node.name}</CardTitle>
          </div>
        </Link>
        <button onClick={onShowDetails}>
          <Info className="size-4" />
        </button>
      </CardHeader>
      <CardContent className="flex-grow space-y-1 text-xs flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          <Tag tags={tagList} />
        </div>
        <div className="border-t border-(--accent-4)/50 my-1"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CpuIcon className="size-4 text-blue-600" />
            <span>{cpuUsage.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <MemoryStickIcon className="size-4 text-green-600" />
            <span>{memUsage.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDriveIcon className="size-4 text-red-600" />
            <span>{diskUsage.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <ZapIcon className="size-4 text-yellow-600" />
            <span>{load}</span>
          </div>
        </div>
        <div className="flex grid grid-cols-2">
          <div className="flex items-center col-span-1">
            <GaugeIcon className="size-5 text-(--accent-11) mr-2" />
            <div>
              <div>
                {t("node.uploadPrefix")}{" "}
                {stats
                  ? formatBytes(stats.net_out, true)
                  : t("node.notAvailable")}
              </div>
              <div>
                {t("node.downloadPrefix")}{" "}
                {stats
                  ? formatBytes(stats.net_in, true)
                  : t("node.notAvailable")}
              </div>
            </div>
          </div>
          <div className="flex items-center col-span-1">
            <ArrowUpDownIcon className="size-5 text-(--accent-11) mr-2" />
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
          </div>
        </div>
        <div className="flex grid grid-cols-2">
          <span className="col-span-1">
            <span className="mr-1">{t("node.expiredAt")}</span>
            <span>{expired_at}</span>
          </span>
          <span className="col-span-1">
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
      </CardContent>
    </Card>
  );
};
