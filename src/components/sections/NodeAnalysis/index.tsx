import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useMobile";
import type { NodeData } from "@/types/node";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocale } from "@/config/hooks";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { BaseInfo } from "./BaseInfo";
import { LoadInfo } from "./LoadInfo";
import { LatencyInfo } from "./LatencyInfo";
import { RegionMap } from "./RegionMap";
import { cn } from "@/utils";

interface NodeAnalysisProps {
  nodes: (NodeData & { stats?: any })[];
  groups: string[];
}

export const NodeAnalysis = ({ nodes, groups }: NodeAnalysisProps) => {
  const isMobile = useIsMobile();
  const { t } = useLocale();
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(
    t("analysis.baseInfo")
  );

  const analysisTypes = [
    t("analysis.baseInfo"),
    t("analysis.loadInfo"),
    t("analysis.latencyInfo"),
    t("analysis.regionMap"),
  ];

  const nodesByGroup = nodes.reduce((acc, node) => {
    const group = node.group || t("group.ungrouped");
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(node);
    return acc;
  }, {} as Record<string, (NodeData & { stats?: any })[]>);

  const groupOrder = [...groups.filter((g) => g !== t("group.all"))];
  const ungroupedLabel = t("group.ungrouped");
  if (nodes.some((n) => !n.group)) {
    if (!groupOrder.includes(ungroupedLabel)) {
      groupOrder.push(ungroupedLabel);
    }
  }

  useEffect(() => {
    const filteredGroups = groups.filter((g) => g !== t("group.all"));
    if (filteredGroups.length > 0) {
      setExpandedGroups([filteredGroups[0]]);
    } else {
      setExpandedGroups([t("group.all")]);
    }
  }, [groups, t]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNodes(nodes.map((n) => n.name));
    } else {
      setSelectedNodes([]);
    }
  };

  const toggleAllGroups = () => {
    if (expandedGroups.length === groupOrder.length) {
      setExpandedGroups([]);
    } else {
      setExpandedGroups(groupOrder);
    }
  };

  const handleGroupChange = (group: string, checked: boolean) => {
    const groupNodeIds = nodesByGroup[group].map((n) => n.name);
    if (checked) {
      setSelectedNodes((prev) => [...new Set([...prev, ...groupNodeIds])]);
    } else {
      setSelectedNodes((prev) =>
        prev.filter((id) => !groupNodeIds.includes(id))
      );
    }
  };

  const handleNodeChange = (nodeId: string, checked: boolean) => {
    if (checked) {
      setSelectedNodes((prev) => [...prev, nodeId]);
    } else {
      setSelectedNodes((prev) => prev.filter((id) => id !== nodeId));
    }
  };

  const isGroupSelected = (group: string) => {
    if (!nodesByGroup[group] || nodesByGroup[group].length === 0) return false;
    const groupNodeIds = nodesByGroup[group].map((n) => n.name);
    return groupNodeIds.every((id) => selectedNodes.includes(id));
  };

  const areAllNodesSelected = selectedNodes.length === nodes.length;

  const renderInfoContent = () => {
    const filteredNodes = nodes.filter((n) => selectedNodes.includes(n.name));

    if (selectedAnalysis === t("analysis.baseInfo")) {
      return <BaseInfo nodes={filteredNodes} />;
    }
    if (selectedAnalysis === t("analysis.loadInfo")) {
      return <LoadInfo />;
    }
    if (selectedAnalysis === t("analysis.latencyInfo")) {
      return <LatencyInfo />;
    }
    if (selectedAnalysis === t("analysis.regionMap")) {
      return <RegionMap />;
    }
    return <BaseInfo nodes={filteredNodes} />;
  };

  return (
    <>
      <Card className="flex overflow-auto whitespace-nowrap overflow-x-auto items-center min-w-[300px] text-primary space-x-4 px-4 my-4">
        {analysisTypes.map((type) => (
          <Button
            key={type}
            variant={selectedAnalysis === type ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedAnalysis?.(type)}>
            {type}
          </Button>
        ))}
      </Card>
      <div
        className={cn(
          "grid gap-4 items-start",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}>
        <div className={isMobile ? "w-full" : "col-span-1"}>
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={areAllNodesSelected}
                    onCheckedChange={(checked: boolean) =>
                      handleSelectAll(checked)
                    }
                  />
                  <label
                    htmlFor="select-all"
                    className="text-base font-semibold">
                    {t("analysis.nodeSelection")}
                  </label>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleAllGroups}>
                  {expandedGroups.length === groupOrder.length ? (
                    <ChevronsDownUp className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <div className="border-t border-(--accent-4)/50 my-2 mx-4"></div>
            <CardContent
              className={cn(
                "pt-2",
                isMobile ? "h-[45vh]" : "h-[calc(100vh-15rem)]"
              )}>
              <ScrollArea className="h-full">
                <ul className="space-y-1">
                  {groups.length === 1 && groups[0] === t("group.all")
                    ? nodes.map((node) => (
                        <li
                          key={node.name}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`node-${node.name}`}
                            checked={selectedNodes.includes(node.name)}
                            onCheckedChange={(checked: boolean) =>
                              handleNodeChange(node.name, checked)
                            }
                          />
                          <label className="text-sm font-normal">
                            {node.name}
                          </label>
                        </li>
                      ))
                    : groupOrder.map((group) => (
                        <li key={group}>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`group-${group}`}
                              checked={isGroupSelected(group)}
                              onCheckedChange={(checked: boolean) =>
                                handleGroupChange(group, checked)
                              }
                            />
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleGroup(group)}>
                              <label className="font-semibold cursor-pointer">
                                {group}
                              </label>
                              <span className="text-xs text-secondary-foreground ml-2">
                                ({nodesByGroup[group]?.length || 0})
                              </span>
                              <ChevronRight
                                className={`w-4 h-4 ml-1 transform transition-transform ${
                                  expandedGroups.includes(group)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                          {expandedGroups.includes(group) && (
                            <ul className="pl-6 mt-1 space-y-1">
                              {nodesByGroup[group]?.map((node) => (
                                <li
                                  key={node.name}
                                  className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`node-${node.name}`}
                                    checked={selectedNodes.includes(node.name)}
                                    onCheckedChange={(checked: boolean) =>
                                      handleNodeChange(node.name, checked)
                                    }
                                  />
                                  <label className="text-sm font-normal">
                                    {node.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className={isMobile ? "w-full" : "col-span-3"}>
          {renderInfoContent()}
        </div>
      </div>
    </>
  );
};
