import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { useAppConfig, useLocale } from "@/config";
import type { NodeData } from "@/types/node";
import { formatBillingCycle, formatBytes } from "@/utils/formatHelper";
import { useMemo } from "react";

interface BaseInfoProps {
  nodes: (NodeData & { stats?: any })[];
}

export const BaseInfo = ({ nodes }: BaseInfoProps) => {
  const { t } = useLocale();
  const { selectThemeColor } = useAppConfig();

  const summary = useMemo(() => {
    if (nodes.length === 0) return null;

    const summaryData = {
      // Static Info
      cpu_cores: 0,
      mem_total: 0,
      swap_total: 0,
      disk_total: 0,
      os: new Map<string, number>(),
      arch: new Map<string, number>(),
      virtualization: new Map<string, number>(),
      regions: new Map<string, number>(),
      billing_cycles: new Map<number, number>(),

      // Live Stats
      online_nodes: 0,
      cpu_usage: 0,
      ram_used: 0,
      swap_used: 0,
      disk_used: 0,
      load1: 0,
      load5: 0,
      load15: 0,
      network_up: 0,
      network_down: 0,
      total_traffic_up: 0,
      total_traffic_down: 0,
      tcp_connections: 0,
      udp_connections: 0,
    };

    nodes.forEach((node) => {
      // Static Info
      summaryData.cpu_cores += node.cpu_cores;
      summaryData.mem_total += node.mem_total;
      summaryData.swap_total += node.swap_total;
      summaryData.disk_total += node.disk_total;
      summaryData.os.set(node.os, (summaryData.os.get(node.os) || 0) + 1);
      summaryData.arch.set(
        node.arch,
        (summaryData.arch.get(node.arch) || 0) + 1
      );
      summaryData.virtualization.set(
        node.virtualization,
        (summaryData.virtualization.get(node.virtualization) || 0) + 1
      );
      summaryData.regions.set(
        node.region,
        (summaryData.regions.get(node.region) || 0) + 1
      );
      const cycle = node.billing_cycle || 0;
      summaryData.billing_cycles.set(
        cycle,
        (summaryData.billing_cycles.get(cycle) || 0) + 1
      );

      // Live Stats
      if (node.stats && node.stats.online) {
        summaryData.online_nodes++;
        summaryData.cpu_usage += node.stats.cpu || 0;
        summaryData.ram_used += node.stats.ram || 0;
        summaryData.swap_used += node.stats.swap || 0;
        summaryData.disk_used += node.stats.disk || 0;
        summaryData.load1 += node.stats.load || 0;
        summaryData.load5 += node.stats.load5 || 0;
        summaryData.load15 += node.stats.load15 || 0;
        summaryData.network_up += node.stats.net_out || 0;
        summaryData.network_down += node.stats.net_in || 0;
        summaryData.total_traffic_up += node.stats.net_total_up || 0;
        summaryData.total_traffic_down += node.stats.net_total_down || 0;
        summaryData.tcp_connections += node.stats.connections || 0;
        summaryData.udp_connections += node.stats.connections_udp || 0;
      }
    });

    if (summaryData.online_nodes > 0) {
      summaryData.cpu_usage /= summaryData.online_nodes;
      summaryData.load1 /= summaryData.online_nodes;
      summaryData.load5 /= summaryData.online_nodes;
      summaryData.load15 /= summaryData.online_nodes;
    }

    return summaryData;
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <Card className="h-full p-4 flex items-center justify-center">
        {t("analysis.selectNodesToView")}
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const formatDistribution = (
    distributionMap: Map<string | number, number>,
    formatter: (key: any) => string = (key) => key.toString()
  ) => {
    if (!distributionMap || distributionMap.size === 0) return "N/A";
    const elements = Array.from(distributionMap.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .flatMap(([key, count], index) => [
        index > 0 ? ", " : null,
        <span
          key={key.toString()}
          className="inline-flex items-center gap-1 whitespace-nowrap">
          {formatter(key)}
          <Tag tags={[count.toString()]} themeColor={selectThemeColor} />
        </span>,
      ]);
    return <>{elements.filter(Boolean)}</>;
  };

  const formatOSName = (os: string): string => {
    if (!os) return "N/A";
    const match = os.match(/(\d+(\.\d+)*)/);
    const version = match ? ` ${match[0]}` : "";
    if (version) return `${os.split(" ")[0]}${version}`;
    return os.split(" ")[0];
  };

  const osDistribution = formatDistribution(summary.os, formatOSName);
  const archDistribution = formatDistribution(summary.arch);
  const virtualizationDistribution = formatDistribution(summary.virtualization);
  const regionDistribution = formatDistribution(summary.regions);
  const billingCycleDistribution = formatDistribution(
    summary.billing_cycles,
    formatBillingCycle
  );

  return (
    <Card className="h-full p-4">
      <div className="space-y-6">
        {/* Section 1: Resource Overview */}
        <InfoSection title={t("analysis.section.resources")}>
          <InfoItem
            title={t("analysis.totalNodes")}
            value={`${summary.online_nodes} / ${nodes.length} `}
          />
          <InfoItem
            title={t("analysis.cpu")}
            value={`${summary.cpu_usage.toFixed(1)}% / ${summary.cpu_cores} ${t(
              "node.cores"
            )}`}
          />
          <InfoItem
            title={t("analysis.ram")}
            value={`${formatBytes(summary.ram_used)} / ${formatBytes(
              summary.mem_total
            )}`}
          />
          <InfoItem
            title={t("analysis.swap")}
            value={`${formatBytes(summary.swap_used)} / ${formatBytes(
              summary.swap_total
            )}`}
          />
          <InfoItem
            title={t("analysis.disk")}
            value={`${formatBytes(summary.disk_used)} / ${formatBytes(
              summary.disk_total
            )}`}
          />
          <InfoItem
            title={t("analysis.load")}
            value={`${summary.load1.toFixed(2)} | ${summary.load5.toFixed(
              2
            )} | ${summary.load15.toFixed(2)}`}
          />
          <InfoItem
            title={t("analysis.networkSpeed")}
            value={`↑ ${formatBytes(summary.network_up, true)} ↓ ${formatBytes(
              summary.network_down,
              true
            )}`}
          />
          <InfoItem
            title={t("analysis.traffic")}
            value={`↑ ${formatBytes(summary.total_traffic_up)} ↓ ${formatBytes(
              summary.total_traffic_down
            )}`}
          />
          <InfoItem
            title={t("analysis.connections")}
            value={`TCP: ${summary.tcp_connections} | UDP: ${summary.udp_connections}`}
          />
        </InfoSection>

        {/* Section 2: Distribution */}
        <InfoSection title={t("analysis.section.distribution")}>
          <InfoItem
            title={t("analysis.osDistribution")}
            value={osDistribution}
          />
          <InfoItem
            title={t("analysis.archDistribution")}
            value={archDistribution}
          />
          <InfoItem
            title={t("analysis.virtualizationDistribution")}
            value={virtualizationDistribution}
          />
          <InfoItem
            title={t("analysis.regionDistribution")}
            value={regionDistribution}
          />
          <InfoItem
            title={t("analysis.billingCycleDistribution")}
            value={billingCycleDistribution}
          />
        </InfoSection>
      </div>
    </Card>
  );
};

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-lg font-semibold">{title}</div>
    <div className="border-t border-(--accent-4)/50 my-2"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
      {children}
    </div>
  </div>
);

const InfoItem = ({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) => (
  <div className="p-2 rounded-md">
    <p className="text-sm text-secondary-foreground">{title}</p>
    <div className="text-base font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
      {value}
    </div>
  </div>
);
