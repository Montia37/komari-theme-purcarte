import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import type { NodeData, NodeWithStatus } from "@/types/node";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Instance from "./Instance";
const LoadCharts = lazy(() => import("./LoadCharts"));
const PingChart = lazy(() => import("./PingChart"));
import Loading from "@/components/loading";
import Flag from "@/components/sections/Flag";
import { useConfigItem } from "@/config";
import { useIsMobile } from "@/hooks/useMobile";

const InstancePage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const {
    nodes: staticNodes,
    publicSettings,
    loading: nodesLoading,
  } = useNodeData();
  const { liveData } = useLiveData();
  useNodeData();
  const [staticNode, setStaticNode] = useState<NodeData | null>(null);
  const [chartType, setChartType] = useState<"load" | "ping">("load");
  const [loadHours, setLoadHours] = useState<number>(0);
  const [pingHours, setPingHours] = useState<number>(1); // 默认1小时
  const enableInstanceDetail = useConfigItem("enableInstanceDetail");
  const enablePingChart = useConfigItem("enablePingChart");
  const isMobile = useIsMobile();

  const maxRecordPreserveTime = publicSettings?.record_preserve_time || 0; // 默认0表示关闭
  const maxPingRecordPreserveTime =
    publicSettings?.ping_record_preserve_time || 24; // 默认1天

  const timeRanges = useMemo(() => {
    return [
      { label: "实时", hours: 0 },
      { label: "1小时", hours: 1 },
      { label: "6小时", hours: 6 },
      { label: "1天", hours: 24 },
      { label: "7天", hours: 168 },
      { label: "30天", hours: 720 },
    ];
  }, []);

  const pingTimeRanges = useMemo(() => {
    const filtered = timeRanges.filter(
      (range) => range.hours !== 0 && range.hours <= maxPingRecordPreserveTime
    );

    if (maxPingRecordPreserveTime > 720) {
      filtered.push({
        label: `${maxPingRecordPreserveTime}小时`,
        hours: maxPingRecordPreserveTime,
      });
    }

    return filtered;
  }, [timeRanges, maxPingRecordPreserveTime]);

  const loadTimeRanges = useMemo(() => {
    const filtered = timeRanges.filter(
      (range) => range.hours <= maxRecordPreserveTime
    );
    if (maxRecordPreserveTime > 720) {
      filtered.push({
        label: `${maxRecordPreserveTime}小时`,
        hours: maxRecordPreserveTime,
      });
    }

    return filtered;
  }, [timeRanges, maxRecordPreserveTime]);

  useEffect(() => {
    const foundNode = staticNodes.find((n) => n.uuid === uuid);
    setStaticNode(foundNode || null);
  }, [staticNodes, uuid]);

  const node = useMemo(() => {
    if (!staticNode) return null;
    const isOnline = liveData?.online.includes(staticNode.uuid) ?? false;
    const stats = isOnline ? liveData?.data[staticNode.uuid] : undefined;
    return {
      ...staticNode,
      status: isOnline ? "online" : "offline",
      stats,
    };
  }, [staticNode, liveData]);

  if (!node || !staticNode) {
    if (nodesLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loading text="正在获取节点信息..." />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        未找到该节点
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-screen-2xl mx-auto flex-1 flex flex-col pb-15 p-4 space-y-4">
      <div className="flex items-center justify-between bg-card box-border border border-border rounded-lg p-4 mb-4 text-secondary-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            className="bg-card flex-shrink-0"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Flag flag={node.region}></Flag>
            <span className="text-xl md:text-2xl font-bold">{node.name}</span>
          </div>
          <span className="text-sm text-secondary-foreground flex-shrink-0">
            {node.status === "online" ? "在线" : "离线"}
          </span>
        </div>
      </div>

      {enableInstanceDetail && <Instance node={node as NodeWithStatus} />}

      <div className="flex flex-col items-center w-full space-y-4">
        <div className="bg-card box-border border border-border rounded-lg p-2">
          <div className="flex justify-center space-x-2">
            <Button
              variant={chartType === "load" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("load")}>
              负载
            </Button>
            {enablePingChart && (
              <Button
                variant={chartType === "ping" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("ping")}>
                延迟
              </Button>
            )}
          </div>
        </div>
        <div
          className={`bg-card box-border border border-border justify-center rounded-lg p-2 ${
            isMobile ? "w-full" : ""
          }`}>
          {chartType === "load" ? (
            <div className="flex space-x-2 overflow-x-auto whitespace-nowrap">
              {loadTimeRanges.map((range) => (
                <Button
                  key={range.label}
                  variant={loadHours === range.hours ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setLoadHours(range.hours)}>
                  {range.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto whitespace-nowrap">
              {pingTimeRanges.map((range) => (
                <Button
                  key={range.label}
                  variant={pingHours === range.hours ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPingHours(range.hours)}>
                  {range.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <Loading text="正在加载图表..." />
          </div>
        }>
        {chartType === "load" && staticNode ? (
          <LoadCharts
            node={staticNode}
            hours={loadHours}
            liveData={liveData?.data[staticNode.uuid]}
          />
        ) : chartType === "ping" && staticNode ? (
          <PingChart node={staticNode} hours={pingHours} />
        ) : null}
      </Suspense>
    </div>
  );
};

export default InstancePage;
