import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { useLocale } from "@/config/hooks";
import { NodeDisplayContainer } from "./NodeDisplay";

interface NodeCompactContainerProps {
  nodes: NodeData[];
}

export const NodeCompactContainer = ({ nodes }: NodeCompactContainerProps) => {
  return (
    <NodeDisplayContainer nodes={nodes}>
      {(node, onShowDetails) => (
        <NodeCompact
          key={node.uuid}
          node={node}
          onShowDetails={onShowDetails}
        />
      )}
    </NodeDisplayContainer>
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
      className={`flex flex-col mx-auto w-full max-w-sm ${
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
