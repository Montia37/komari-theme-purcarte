import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { NodeGridContainer } from "@/components/sections/NodeGrid";
import { NodeCompactContainer } from "@/components/sections/NodeCompact";
import { NodeTable } from "@/components/sections/NodeTable";
import Loading from "@/components/loading";
import type { NodeData } from "@/types/node";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useAppConfig } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useMobile";
import { useLocale } from "@/config/hooks";
import { cn } from "@/utils";

interface HomePageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredNodes: (NodeData & { stats?: any })[];
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  stats: any;
  groups: string[];
  handleSort: (key: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  searchTerm,
  setSearchTerm,
  filteredNodes,
  selectedGroup,
  setSelectedGroup,
  stats,
  groups,
  handleSort,
}) => {
  const { viewMode, statusCardsVisibility, setStatusCardsVisibility } =
    useTheme();
  const { loading, error, refreshNodes } = useNodeData();
  const {
    enableGroupedBar,
    enableStatsBar,
    enableSwap,
    enableListItemProgressBar,
    selectTrafficProgressStyle,
    isShowStatsInHeader,
    mergeGroupsWithStats,
  } = useAppConfig();
  const { t } = useLocale();

  const isMobile = useIsMobile();

  const hasSearchTerm = searchTerm.trim().length > 0;

  if (loading) {
    return <Loading text={t("homePage.loadingData")} />;
  }

  const renderContent = () => {
    if (viewMode === "grid") {
      return (
        <NodeGridContainer
          nodes={filteredNodes}
          enableSwap={enableSwap}
          selectTrafficProgressStyle={selectTrafficProgressStyle}
        />
      );
    }
    if (viewMode === "compact") {
      return <NodeCompactContainer nodes={filteredNodes} />;
    }
    if (viewMode === "table") {
      return (
        <NodeTable
          nodes={filteredNodes}
          enableSwap={enableSwap}
          enableListItemProgressBar={enableListItemProgressBar}
          selectTrafficProgressStyle={selectTrafficProgressStyle}
        />
      );
    }
    return null;
  };

  return (
    <div className="fade-in my-4">
      {enableStatsBar && (!isShowStatsInHeader || isMobile) && (
        <StatsBar
          displayOptions={statusCardsVisibility}
          setDisplayOptions={setStatusCardsVisibility}
          stats={stats}
          loading={loading}
          isShowStatsInHeader={isShowStatsInHeader}
          enableGroupedBar={enableGroupedBar}
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          onSort={handleSort}
        />
      )}

      {enableGroupedBar && !mergeGroupsWithStats && (
        <div className="flex purcarte-blur theme-card-style overflow-auto whitespace-nowrap overflow-x-auto items-center min-w-[300px] text-primary space-x-4 px-4 my-4">
          <span>{t("group.name")}</span>
          {groups?.map((group: string) => (
            <Button
              key={group}
              variant={selectedGroup === group ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedGroup?.(group)}>
              {group}
            </Button>
          ))}
        </div>
      )}

      <div className={cn("space-y-4", viewMode === "table" && "-mx-2 -mb-2")}>
        {filteredNodes.length > 0 ? (
          renderContent()
        ) : (
          <div className="flex flex-grow items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {hasSearchTerm
                    ? t("search.notFound")
                    : error
                    ? t("homePage.errorFetchingNodes")
                    : t("homePage.noNodes")}
                </CardTitle>
                <CardDescription>
                  {hasSearchTerm
                    ? t("search.tryChangingFilters")
                    : error
                    ? t("homePage.retryFetchingNodes")
                    : t("homePage.addNodesInAdmin")}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {hasSearchTerm ? (
                  <Button onClick={() => setSearchTerm("")} className="w-full">
                    {t("search.clear")}
                  </Button>
                ) : error ? (
                  <Button
                    onClick={() => void refreshNodes()}
                    className="w-full">
                    {t("search.retry")}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      window.open("/admin", "_blank", "noopener,noreferrer")
                    }
                    className="w-full">
                    {t("homePage.addNode")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
