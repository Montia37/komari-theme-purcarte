import { useEffect, useMemo, useState } from "react";
import { cn, formatBytes } from "@/utils";
import { useAppConfig } from "@/config";
import { useIsMobile } from "@/hooks/useMobile";
import { CurrentTimeChip, StatChip } from "./StatChips";
import { GroupSelector } from "./GroupSelector";
import { SortToggleMenu } from "./SortToggleMenu";
import { StatsToggleMenu } from "./StatsToggleMenu";
import { useLocale } from "@/config/hooks";
import type { StatsBarProps, SortKey } from "./types";
import { Card } from "@/components/ui/card";
export type { StatsBarProps };

interface StatEntry {
  key: string;
  label: string;
  lines: string[];
  isLabelVertical?: boolean;
  textLeft?: boolean;
}

export const StatsBar = (props: StatsBarProps) => {
  const {
    displayOptions,
    setDisplayOptions,
    stats,
    loading,
    groups,
    selectedGroup,
    onSelectGroup,
    onSort: onSortProp,
    sortKey: sortKeyProp,
    sortDirection: sortDirectionProp,
  } = props;

  const [sortState, setSortState] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: sortKeyProp ?? null,
    direction: sortDirectionProp ?? "desc",
  });

  useEffect(() => {
    setSortState({
      key: sortKeyProp ?? null,
      direction: sortDirectionProp ?? "desc",
    });
  }, [sortKeyProp, sortDirectionProp]);

  const { key: sortKey, direction: sortDirection } = sortState;

  const handleSort = (key: SortKey) => {
    let newDirection: "asc" | "desc" = "desc";
    if (key !== null && key === sortKey) {
      newDirection = sortDirection === "desc" ? "asc" : "desc";
    }
    setSortState({ key, direction: newDirection });
    if (onSortProp) {
      onSortProp(key, newDirection);
    }
  };

  const {
    isShowStatsInHeader,
    mergeGroupsWithStats,
    enableGroupedBar,
    enableSortControl,
  } = useAppConfig();
  const isMobile = useIsMobile();
  const { t } = useLocale();

  const resolvedStats = useMemo<StatEntry[]>(() => {
    const getLabel = (compactLabel: string, fullLabel: string) =>
      isShowStatsInHeader ? (isMobile ? fullLabel : compactLabel) : fullLabel;

    const entries: StatEntry[] = [];
    if (displayOptions.currentOnline) {
      entries.push({
        key: "currentOnline",
        label: getLabel(
          t("statsBar.currentOnline"),
          t("statsBar.currentOnline")
        ),
        lines: [loading ? "..." : `${stats.onlineCount} / ${stats.totalCount}`],
      });
    }
    if (displayOptions.regionOverview) {
      entries.push({
        key: "regionOverview",
        label: getLabel(t("statsBar.region"), t("statsBar.region")),
        lines: [loading ? "..." : String(stats.uniqueRegions)],
      });
    }
    if (displayOptions.trafficOverview) {
      entries.push({
        key: "trafficOverview",
        label: getLabel(t("statsBar.trafficShort"), t("statsBar.traffic")),
        lines: loading
          ? ["..."]
          : [
              `${t("node.uploadPrefix")} ${formatBytes(stats.totalTrafficUp)}`,
              `${t("node.downloadPrefix")} ${formatBytes(
                stats.totalTrafficDown
              )}`,
            ],
        isLabelVertical: !isMobile && isShowStatsInHeader,
        textLeft: true,
      });
    }
    if (displayOptions.networkSpeed) {
      entries.push({
        key: "networkSpeed",
        label: getLabel(
          t("statsBar.networkSpeedShort"),
          t("statsBar.networkSpeed")
        ),
        lines: loading
          ? ["..."]
          : [
              `${t("node.uploadPrefix")} ${formatBytes(
                stats.currentSpeedUp
              )}/s`,
              `${t("node.downloadPrefix")} ${formatBytes(
                stats.currentSpeedDown
              )}/s`,
            ],
        isLabelVertical: !isMobile && isShowStatsInHeader,
        textLeft: true,
      });
    }
    return entries;
  }, [displayOptions, loading, stats, isMobile, isShowStatsInHeader, t]);

  const hasVisibleStats = Object.values(displayOptions).some(Boolean);

  if (isShowStatsInHeader && !isMobile) {
    return (
      <div className="flex items-center gap-2">
        {enableGroupedBar && mergeGroupsWithStats && (
          <GroupSelector
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={onSelectGroup}
          />
        )}
        <div className="flex items-center gap-1.5">
          {displayOptions.currentTime && (
            <CurrentTimeChip isInHeader={true} isMobile={isMobile} />
          )}
          {resolvedStats.map(({ key, ...rest }) => (
            <StatChip
              key={key}
              {...rest}
              isInHeader={true}
              isMobile={isMobile}
            />
          ))}
          <StatsToggleMenu
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />
          {enableSortControl && (
            <SortToggleMenu
              onSort={handleSort}
              sortKey={sortKey}
              sortDirection={sortDirection}
            />
          )}
        </div>
      </div>
    );
  }

  const getGridTemplateColumns = () => {
    if (!isMobile) {
      return "repeat(auto-fit, minmax(100px, 1fr))";
    }
    const visibleCount =
      resolvedStats.length +
      (displayOptions.currentTime ? 1 : 0) +
      (enableGroupedBar && mergeGroupsWithStats ? 1 : 0);

    return visibleCount >= 5 ? "repeat(3, 1fr)" : "repeat(2, 1fr)";
  };

  return (
    <Card
      className={cn(
        "relative flex items-center text-primary my-4",
        isMobile ? "text-xs p-2" : "text-sm px-4 min-w-[300px] min-h-[5rem]"
      )}>
      <div
        className="grid w-full gap-2 text-center items-center py-3"
        style={{
          gridTemplateColumns: getGridTemplateColumns(),
          gridAutoRows: "min-content",
        }}>
        {enableGroupedBar && mergeGroupsWithStats && (
          <div className="flex flex-col items-center">
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={onSelectGroup}
            />
          </div>
        )}

        {hasVisibleStats ? (
          <>
            {displayOptions.currentTime && (
              <CurrentTimeChip isMobile={isMobile} />
            )}
            {resolvedStats.map(({ key, ...rest }) => (
              <StatChip key={key} {...rest} isMobile={isMobile} />
            ))}
          </>
        ) : (
          <span className="text-xs text-secondary-foreground">
            {t("statsBar.statsHidden")}
          </span>
        )}
      </div>
      <div className="absolute right-2 top-2">
        <StatsToggleMenu
          displayOptions={displayOptions}
          setDisplayOptions={setDisplayOptions}
        />
      </div>
      {enableSortControl && (
        <div className="absolute right-2">
          <SortToggleMenu
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
        </div>
      )}
    </Card>
  );
};
