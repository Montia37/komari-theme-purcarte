import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid3X3,
  Table2,
  Rows3,
  Moon,
  Sun,
  SunMoon,
  CircleUserIcon,
  Menu,
} from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppConfig } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/config/hooks";

import { StatsBar } from "../sections/StatsBar";
import type { StatsBarProps } from "../sections/StatsBar";
import EditButton from "../settings/EditButton";
import { Card } from "../ui/card";
import { cn } from "@/utils";

interface HeaderProps extends Partial<StatsBarProps> {
  isPrivate?: boolean;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  setIsSettingsOpen?: (isOpen: boolean) => void;
}

const ViewModeIcons = {
  grid: Grid3X3,
  compact: Rows3,
  table: Table2,
};

const ThemeIcons = {
  light: Sun,
  dark: Moon,
  system: SunMoon,
};

const ViewMenuItems = ({
  setViewMode,
}: {
  setViewMode: (mode: "grid" | "compact" | "table") => void;
}) => {
  const { t } = useLocale();
  return (
    <>
      <DropdownMenuItem onClick={() => setViewMode("grid")}>
        <Grid3X3 className="size-4 mr-2 text-primary" />
        <span>{t("header.grid")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setViewMode("compact")}>
        <Rows3 className="size-4 mr-2 text-primary" />
        <span>{t("header.compact")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setViewMode("table")}>
        <Table2 className="size-4 mr-2 text-primary" />
        <span>{t("header.table")}</span>
      </DropdownMenuItem>
    </>
  );
};

const ThemeMenuItems = ({
  setAppearance,
}: {
  setAppearance: (appearance: "light" | "dark" | "system") => void;
}) => {
  const { t } = useLocale();
  return (
    <>
      <DropdownMenuItem onClick={() => setAppearance("light")}>
        <Sun className="size-4 mr-2 text-primary" />
        <span>{t("header.lightMode")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setAppearance("dark")}>
        <Moon className="size-4 mr-2 text-primary" />
        <span>{t("header.darkMode")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setAppearance("system")}>
        <SunMoon className="size-4 mr-2 text-primary" />
        <span>{t("header.systemMode")}</span>
      </DropdownMenuItem>
    </>
  );
};

const ViewModeSwitcher = ({ isMobile }: { isMobile?: boolean }) => {
  const { viewMode, setViewMode } = useTheme();
  const { t } = useLocale();
  const Icon = ViewModeIcons[viewMode];

  if (isMobile) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon className="size-4 mr-2 text-primary" />
          <span>{t("header.toggleView")}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="purcarte-blur border-(--accent-4)/50 rounded-xl">
          <ViewMenuItems setViewMode={setViewMode} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="size-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="purcarte-blur mt-[.5rem] border-(--accent-4)/50 rounded-xl">
        <ViewMenuItems setViewMode={setViewMode} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ThemeSwitcher = ({ isMobile }: { isMobile?: boolean }) => {
  const { rawAppearance, setAppearance } = useTheme();
  const { t } = useLocale();
  const Icon = ThemeIcons[rawAppearance];

  if (isMobile) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon className="size-4 mr-2 text-primary" />
          <span>{t("header.toggleTheme")}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="purcarte-blur border-(--accent-4)/50 rounded-xl">
          <ThemeMenuItems setAppearance={setAppearance} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="size-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="purcarte-blur mt-[.5rem] border-(--accent-4)/50 rounded-xl">
        <ThemeMenuItems setAppearance={setAppearance} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminButton = ({ isMobile }: { isMobile?: boolean }) => {
  const { t } = useLocale();
  const { enableAdminButton } = useAppConfig();

  if (!enableAdminButton) return null;

  if (isMobile) {
    return (
      <DropdownMenuItem asChild>
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center">
          <CircleUserIcon className="size-4 mr-2 text-primary" />
          <span>{t("header.admin")}</span>
        </a>
      </DropdownMenuItem>
    );
  }

  return (
    <a href="/admin" target="_blank" rel="noopener noreferrer">
      <Button variant="ghost" size="icon">
        <CircleUserIcon className="size-5 text-primary" />
      </Button>
    </a>
  );
};

const SearchBar = ({
  isMobile,
  searchTerm,
  setSearchTerm,
}: {
  isMobile?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => {
  const { t } = useLocale();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { enableSearchButton } = useAppConfig();

  if (!enableSearchButton || searchTerm === undefined || !setSearchTerm) {
    return null;
  }

  if (isMobile) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative group">
            <Search className="size-5 text-primary" />
            {searchTerm && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2"></span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="purcarte-blur border-(--accent-4)/50 rounded-xl w-[90vw] translate-x-[5vw] mt-[.5rem] max-w-screen-2xl">
          <div className="p-2">
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              className="w-full"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <div
        className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden transform ${
          isSearchOpen ? "w-48 opacity-100" : "w-0 opacity-0"
        }`}>
        <Input
          type="search"
          placeholder={t("search.placeholder")}
          className={`transition-all duration-300 ease-in-out ${
            !isSearchOpen && "invisible"
          }`}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="relative group"
        onClick={() => setIsSearchOpen(!isSearchOpen)}>
        <Search className="size-5 text-primary" />
        {searchTerm && (
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2"></span>
        )}
      </Button>
    </>
  );
};

export const Header = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
  const { isPrivate, searchTerm, setSearchTerm, setIsSettingsOpen } = props;
  const location = useLocation();
  const isInstancePage = location.pathname.startsWith("/instance");
  const {
    selectedHeaderStyle,
    enableTitle,
    titleText,
    enableLogo,
    logoUrl,
    isShowStatsInHeader,
    siteStatus,
    isShowConfigEditButtonInLogined,
  } = useAppConfig();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (titleText) {
      document.title = titleText;
    }
  }, [titleText]);

  return (
    <header
      ref={ref}
      className={cn(
        selectedHeaderStyle === "levitation" ? "fixed" : "sticky",
        "top-0 left-0 right-0 flex z-10"
      )}>
      <Card className="rounded-none w-full flex items-center justify-center">
        <div className="w-(--main-width) max-w-screen-2xl py-2 flex items-center justify-between">
          <div className="flex items-center theme-text-shadow text-accent-foreground">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold">
              {enableLogo && logoUrl && (
                <img src={logoUrl} alt="logo" className="h-8" />
              )}
              {enableTitle && <span>{titleText}</span>}
            </a>
          </div>

          {!isInstancePage &&
            isShowStatsInHeader &&
            !isMobile &&
            !isPrivate && (
              <div className="flex-1 flex justify-center">
                <StatsBar {...(props as Required<StatsBarProps>)} />
              </div>
            )}

          <div className="flex items-center space-x-2">
            {isMobile ? (
              <>
                {!isInstancePage && (
                  <SearchBar
                    isMobile
                    searchTerm={searchTerm!}
                    setSearchTerm={setSearchTerm!}
                  />
                )}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative group">
                      <Menu className="size-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2 scale-0 transition-transform duration-300 group-data-[state=open]:scale-100"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="purcarte-blur mt-[.5rem] border-(--accent-4)/50 rounded-xl">
                    {!isInstancePage && <ViewModeSwitcher isMobile />}
                    <ThemeSwitcher isMobile />
                    <AdminButton isMobile />
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {!isInstancePage && (
                  <>
                    <SearchBar
                      searchTerm={searchTerm!}
                      setSearchTerm={setSearchTerm!}
                    />
                    <ViewModeSwitcher />
                  </>
                )}
                <ThemeSwitcher />
                <AdminButton />
              </>
            )}

            {isShowConfigEditButtonInLogined &&
              (siteStatus === "authenticated" ||
                siteStatus === "private-authenticated") && (
                <EditButton
                  onClick={() => setIsSettingsOpen && setIsSettingsOpen(true)}
                />
              )}
          </div>
        </div>
      </Card>
    </header>
  );
});
