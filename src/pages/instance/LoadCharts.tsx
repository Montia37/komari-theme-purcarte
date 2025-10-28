import { memo, useRef } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData } from "@/types/node";
import { formatBytes } from "@/utils";
import { Flex } from "@radix-ui/themes";
import Loading from "@/components/loading";
import { useLoadCharts } from "@/hooks/useLoadCharts";
import { CustomTooltip } from "@/components/ui/tooltip";
import { lableFormatter, loadChartTimeFormatter } from "@/utils/chartHelper";
import type { RpcNodeStatus } from "@/types/rpc";
import { useLocale } from "@/config/hooks";

interface LoadChartsProps {
  node: NodeData;
  hours: number;
  liveData?: RpcNodeStatus;
  isOnline: boolean;
}

const LoadCharts = memo(
  ({ node, hours, liveData, isOnline }: LoadChartsProps) => {
    const { loading, error, chartData, memoryChartData, isDataEmpty } =
      useLoadCharts(node, hours);
    const { t } = useLocale();

    const chartDataLengthRef = useRef(0);
    chartDataLengthRef.current = chartData.length;

    // 样式和颜色
    const cn = "flex flex-col w-full overflow-hidden";
    const chartMargin = { top: 8, right: 16, bottom: 8, left: 16 };
    const colors = ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"];

    // 图表配置
    const chartConfigs = [
      {
        id: "cpu",
        title: t("chart.cpu"),
        type: "area",
        value: liveData?.cpu
          ? `${liveData.cpu.toFixed(2)}%`
          : t("node.notAvailable"),
        dataKey: "cpu",
        yAxisDomain: [0, 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}%` : "",
        color: colors[0],
        data: chartData,
        tooltipFormatter: (value: number) => `${value.toFixed(2)}%`,
        tooltipLabel: t("chart.cpuUsageTooltip"),
      },
      {
        id: "memory",
        title: t("chart.memory"),
        type: "area",
        value: (
          <Flex gap="0" direction="column" align="end">
            <label>
              {liveData?.ram
                ? `${formatBytes(liveData.ram)} / ${formatBytes(
                    node?.mem_total || 0
                  )}`
                : t("node.notAvailable")}
            </label>
            <label>
              {node?.swap_total === 0
                ? t("node.off")
                : liveData?.swap
                ? `${formatBytes(liveData.swap)} / ${formatBytes(
                    node?.swap_total || 0
                  )}`
                : t("node.notAvailable")}
            </label>
          </Flex>
        ),
        series: [
          {
            dataKey: "ram",
            color: colors[0],
            tooltipLabel: t("chart.memoryUsageTooltip"),
            tooltipFormatter: (value: number, raw: any) =>
              `${formatBytes(raw?.ram_raw || 0)} (${value.toFixed(0)}%)`,
          },
          {
            dataKey: "swap",
            color: colors[1],
            tooltipLabel: t("chart.swapUsageTooltip"),
            tooltipFormatter: (value: number, raw: any) =>
              node.swap_total === 0
                ? t("node.off")
                : `${formatBytes(raw?.swap_raw || 0)} (${value.toFixed(0)}%)`,
          },
        ],
        yAxisDomain: [0, 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}%` : "",
        data: memoryChartData,
      },
      {
        id: "disk",
        title: t("chart.disk"),
        type: "area",
        value: liveData?.disk
          ? `${formatBytes(liveData.disk)} / ${formatBytes(
              node?.disk_total || 0
            )}`
          : t("node.notAvailable"),
        dataKey: "disk",
        yAxisDomain: [0, node?.disk_total || 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? formatBytes(value) : "",
        color: colors[0],
        data: chartData,
        tooltipFormatter: (value: number) => formatBytes(value),
        tooltipLabel: t("chart.diskUsageTooltip"),
      },
      {
        id: "network",
        title: t("chart.network"),
        type: "line",
        value: (
          <>
            <Flex gap="0" align="end" direction="column">
              <span>
                {t("node.uploadPrefix")}{" "}
                {formatBytes(liveData?.net_out || 0, true)}
              </span>
              <span>
                {t("node.downloadPrefix")}{" "}
                {formatBytes(liveData?.net_in || 0, true)}
              </span>
            </Flex>
          </>
        ),
        series: [
          {
            dataKey: "net_in",
            color: colors[0],
            tooltipLabel: t("chart.download"),
            tooltipFormatter: (value: number) => `${formatBytes(value, true)}`,
          },
          {
            dataKey: "net_out",
            color: colors[3],
            tooltipLabel: t("chart.upload"),
            tooltipFormatter: (value: number) => `${formatBytes(value, true)}`,
          },
        ],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? formatBytes(value) : "",
        data: chartData,
      },
      {
        id: "connections",
        title: t("chart.connections"),
        type: "line",
        value: (
          <Flex gap="0" align="end" direction="column">
            <span>
              {t("chart.tcpPrefix")} {liveData?.connections}
            </span>
            <span>
              {t("chart.udpPrefix")} {liveData?.connections_udp}
            </span>
          </Flex>
        ),
        series: [
          {
            dataKey: "connections",
            color: colors[0],
            tooltipLabel: t("chart.tcpConnections"),
          },
          {
            dataKey: "connections_udp",
            color: colors[1],
            tooltipLabel: t("chart.udpConnections"),
          },
        ],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}` : "",
        data: chartData,
      },
      {
        id: "process",
        title: t("chart.processes"),
        type: "line",
        value: liveData?.process || t("node.notAvailable"),
        dataKey: "process",
        color: colors[0],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}` : "",
        data: chartData,
        tooltipLabel: t("chart.processesTooltip"),
      },
    ];

    // 根据配置渲染图表
    const renderChart = (config: any) => {
      const ChartComponent = config.type === "area" ? AreaChart : LineChart;
      const DataComponent =
        config.type === "area" ? Area : (Line as React.ComponentType<any>);

      // 只指定高度，让宽度自适应
      const chartProps = {
        height: 140, // 更小的高度以确保完全适应容器
        style: { overflow: "visible" }, // 通过内联样式解决Safari溢出问题
      };

      const chartConfig = config.series
        ? config.series.reduce((acc: any, series: any) => {
            acc[series.dataKey] = {
              label: series.tooltipLabel || series.dataKey,
              color: series.color,
            };
            return acc;
          }, {})
        : {
            [config.dataKey]: {
              label: config.tooltipLabel || config.dataKey,
              color: config.color,
            },
          };

      return (
        <Card className={cn} key={config.id} style={{ height: "220px" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 h-[80px]">
            <CardTitle className="text-sm font-medium">
              {config.title}
            </CardTitle>
            <div className="text-sm font-bold min-h-[20px] flex items-center">
              {config.value}
            </div>
          </CardHeader>
          <div
            className="h-[150px] w-full px-2 pb-2 align-bottom"
            style={{ minHeight: 0 }}>
            {!loading && !isDataEmpty && (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ChartComponent
                  data={config.data}
                  margin={chartMargin}
                  {...chartProps}>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="var(--theme-line-muted-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={{
                      stroke: "var(--theme-text-muted-color)",
                    }}
                    tick={{
                      fill: "var(--theme-text-muted-color)",
                    }}
                    tickFormatter={(value, index) =>
                      loadChartTimeFormatter(
                        value,
                        index,
                        chartDataLengthRef.current
                      )
                    }
                    interval={0}
                    height={20}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={config.yAxisDomain}
                    tickFormatter={config.yAxisFormatter}
                    orientation="left"
                    type="number"
                    tick={{
                      dx: -8,
                      fill: "var(--theme-text-muted-color)",
                    }}
                    width={200}
                    mirror={true}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props: any) => (
                      <CustomTooltip
                        {...props}
                        chartConfig={config}
                        labelFormatter={(value) => lableFormatter(value, hours)}
                      />
                    )}
                  />
                  {config.series ? (
                    config.series.map((series: any) => (
                      <DataComponent
                        key={series.dataKey}
                        dataKey={series.dataKey}
                        animationDuration={0}
                        stroke={series.color}
                        fill={config.type === "area" ? series.color : undefined}
                        opacity={0.8}
                        dot={false}
                      />
                    ))
                  ) : (
                    <DataComponent
                      dataKey={config.dataKey}
                      animationDuration={0}
                      stroke={config.color}
                      fill={config.type === "area" ? config.color : undefined}
                      opacity={0.8}
                      dot={false}
                    />
                  )}
                </ChartComponent>
              </ChartContainer>
            )}
          </div>
        </Card>
      );
    };

    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <Loading text={t("chart.loadingData")} />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {!isOnline && !loading && hours === 0 && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-lg font-semibold">
              {t("chart.nodeOfflineCannotFetchLiveData")}
            </p>
          </div>
        )}
        {isDataEmpty && !loading && hours > 0 && (
          <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
            <p className="text-lg font-semibold">
              {t("chart.offlineForTooLong", { hours })}
            </p>
          </div>
        )}
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          style={{ minHeight: 0 }}>
          {chartConfigs.map(renderChart)}
        </div>
      </div>
    );
  }
);

export default LoadCharts;
