export type DisplayOptions = {
  currentTime: boolean;
  currentOnline: boolean;
  regionOverview: boolean;
  trafficOverview: boolean;
  networkSpeed: boolean;
};

export type StatsSnapshot = {
  onlineCount: number;
  totalCount: number;
  uniqueRegions: number;
  totalTrafficUp: number;
  totalTrafficDown: number;
  currentSpeedUp: number;
  currentSpeedDown: number;
};

export type SortKey =
  | "trafficUp"
  | "trafficDown"
  | "speedUp"
  | "speedDown"
  | null;

export interface StatsBarProps {
  displayOptions: DisplayOptions;
  setDisplayOptions: (options: Partial<DisplayOptions>) => void;
  stats: StatsSnapshot;
  loading: boolean;
  enableGroupedBar?: boolean;
  groups?: string[];
  selectedGroup?: string;
  onSelectGroup?: (group: string) => void;
  isShowStatsInHeader?: boolean;
  onSort?: (key: SortKey, direction: "asc" | "desc") => void;
  sortKey?: SortKey;
  sortDirection?: "asc" | "desc";
  selectedAnalysis?: string;
  onSelectAnalysis?: (analysis: string) => void;
}
