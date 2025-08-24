import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils";
import { useIsMobile } from "@/hooks/useMobile";

interface StatsBarProps {
  displayOptions: {
    time: boolean;
    online: boolean;
    regions: boolean;
    traffic: boolean;
    speed: boolean;
  };
  setDisplayOptions: (options: any) => void;
  stats: {
    onlineCount: number;
    totalCount: number;
    uniqueRegions: number;
    totalTrafficUp: number;
    totalTrafficDown: number;
    currentSpeedUp: number;
    currentSpeedDown: number;
  };
  loading: boolean;
  currentTime: Date;
}

export const StatsBar = ({
  displayOptions,
  setDisplayOptions,
  stats,
  loading,
  currentTime,
}: StatsBarProps) => {
  const isMobile = useIsMobile();

  // 获取已启用的统计项列表
  const enabledStats = Object.keys(displayOptions).filter(
    (key) => displayOptions[key as keyof typeof displayOptions]
  );

  // 渲染统计项
  const renderStatItem = (key: string) => {
    switch (key) {
      case "time":
        return (
          displayOptions.time && (
            <div className="w-full py-1" key="time">
              <div className="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label className="text-secondary-foreground text-sm">
                  当前时间
                </label>
                <label className="font-medium -mt-2 text-md">
                  {currentTime.toLocaleTimeString()}
                </label>
              </div>
            </div>
          )
        );
      case "online":
        return (
          displayOptions.online && (
            <div className="w-full py-1" key="online">
              <div className="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label className="text-secondary-foreground text-sm">
                  当前在线
                </label>
                <label className="font-medium -mt-2 text-md">
                  {loading
                    ? "..."
                    : `${stats.onlineCount} / ${stats.totalCount}`}
                </label>
              </div>
            </div>
          )
        );
      case "regions":
        return (
          displayOptions.regions && (
            <div className="w-full py-1" key="regions">
              <div className="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label className="text-secondary-foreground text-sm">
                  点亮地区
                </label>
                <label className="font-medium -mt-2 text-md">
                  {loading ? "..." : stats.uniqueRegions}
                </label>
              </div>
            </div>
          )
        );
      case "traffic":
        return (
          displayOptions.traffic && (
            <div className="w-full py-1" key="traffic">
              <div className="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label className="text-secondary-foreground text-sm">
                  流量概览
                </label>
                <div className="font-medium -mt-2 text-md">
                  {loading ? (
                    "..."
                  ) : (
                    <div className="flex flex-col items-center">
                      <span>{`↑ ${formatBytes(stats.totalTrafficUp)}`}</span>
                      <span>{`↓ ${formatBytes(stats.totalTrafficDown)}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        );
      case "speed":
        return (
          displayOptions.speed && (
            <div className="w-full py-1" key="speed">
              <div className="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label className="text-secondary-foreground text-sm">
                  网络速率
                </label>
                <div className="font-medium -mt-2 text-md">
                  {loading ? (
                    "..."
                  ) : (
                    <div className="flex flex-col items-center">
                      <span>{`↑ ${formatBytes(stats.currentSpeedUp)}/s`}</span>
                      <span>{`↓ ${formatBytes(
                        stats.currentSpeedDown
                      )}/s`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        );
      default:
        return null;
    }
  };
  return (
    <div className="bg-card backdrop-blur-[10px] min-w-[300px] rounded-lg text-secondary-foreground my-6 mx-4 px-4 box-border border border-border text-sm relative flex items-center min-h-[5rem]">
      <div className="absolute top-2 right-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Settings2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>状态显示设置</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>当前时间</span>
              <Switch
                checked={displayOptions.time}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ ...displayOptions, time: checked })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>当前在线</span>
              <Switch
                checked={displayOptions.online}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ ...displayOptions, online: checked })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>点亮地区</span>
              <Switch
                checked={displayOptions.regions}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ ...displayOptions, regions: checked })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>流量概览</span>
              <Switch
                checked={displayOptions.traffic}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ ...displayOptions, traffic: checked })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>网络速率</span>
              <Switch
                checked={displayOptions.speed}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ ...displayOptions, speed: checked })
                }
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className="grid w-full gap-2 text-center items-center py-3"
        style={{
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(auto-fit, minmax(180px, 1fr))",
          gridAutoRows: "min-content",
        }}>
        {enabledStats.map((key) => renderStatItem(key))}
      </div>
    </div>
  );
};
