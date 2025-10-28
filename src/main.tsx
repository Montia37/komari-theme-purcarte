import { StrictMode, useEffect, useRef, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/sections/Header";
import { ConfigProvider, useAppConfig } from "@/config";
import { DynamicContent } from "@/components/DynamicContent";
import { useThemeManager, useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import Footer from "@/components/sections/Footer";
import Loading from "./components/loading";
import type { StatsBarProps } from "./components/sections/StatsBar";
import { useNodeListCommons } from "@/hooks/useNodeCommons";
import SettingsPanel from "./components/settings/SettingsPanel";
import { useIsMobile } from "./hooks/useMobile";
import type { SiteStatus } from "./config/default";
const HomePage = lazy(() => import("@/pages/Home"));
const InstancePage = lazy(() => import("@/pages/instance"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const PrivatePage = lazy(() => import("@/pages/Private"));
const LiquidGlassDemo = lazy(() => import("@/test/LiquidGlassDemo"));

const homeScrollState = {
  position: 0,
};

const AppRoutes = ({
  searchTerm,
  setSearchTerm,
  setIsSettingsOpen,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
}) => {
  const location = useLocation();
  const {
    loading,
    groups,
    filteredNodes,
    stats,
    selectedGroup,
    setSelectedGroup,
    handleSort,
  } = useNodeListCommons(searchTerm);
  const { statusCardsVisibility, setStatusCardsVisibility } = useTheme();
  const { enableGroupedBar } = useAppConfig();

  const statsBarProps: StatsBarProps = {
    displayOptions: statusCardsVisibility,
    setDisplayOptions: setStatusCardsVisibility,
    stats,
    loading,
    enableGroupedBar,
    groups,
    selectedGroup,
    onSelectGroup: setSelectedGroup,
    onSort: handleSort,
  };

  const homeViewportRef = useRef<HTMLDivElement | null>(null);
  const instanceViewportRef = useRef<HTMLDivElement | null>(null);

  const handleHomeScroll = () => {
    if (location.pathname === "/" && homeViewportRef.current) {
      homeScrollState.position = homeViewportRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        if (homeViewportRef.current) {
          homeViewportRef.current.scrollTop = homeScrollState.position;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith("/instance")) return;
    const frame = requestAnimationFrame(() => {
      instanceViewportRef.current?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsSettingsOpen={setIsSettingsOpen}
        {...statsBarProps}
      />
      <div className="flex-1 min-h-0">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={
                <ScrollArea
                  className="h-full"
                  viewportRef={homeViewportRef}
                  viewportProps={{ onScroll: handleHomeScroll }}>
                  <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                    <HomePage
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filteredNodes={filteredNodes}
                      selectedGroup={selectedGroup}
                      setSelectedGroup={setSelectedGroup}
                      stats={stats}
                      groups={groups}
                      handleSort={handleSort}
                    />
                  </main>
                </ScrollArea>
              }
            />
            <Route
              path="/instance/:uuid"
              element={
                <ScrollArea
                  className="h-full"
                  viewportRef={instanceViewportRef}>
                  <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                    <InstancePage />
                  </main>
                </ScrollArea>
              }
            />
            <Route
              path="*"
              element={
                <ScrollArea className="h-full">
                  <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                    <NotFoundPage />
                  </main>
                </ScrollArea>
              }
            />
            {import.meta.env.DEV && (
              <Route
                path="/liquid-glass-demo"
                element={
                  <ScrollArea className="h-full">
                    <main className="w-full h-full mx-auto flex-1">
                      <LiquidGlassDemo />
                    </main>
                  </ScrollArea>
                }
              />
            )}
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export const AppContent = () => {
  const { siteStatus, mainWidth } = useAppConfig();
  const { appearance, color } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isSettingsOpen && !isMobile) {
      document.documentElement.style.setProperty(
        "--main-width",
        `calc(${mainWidth}vw - 20rem)`
      );
    } else {
      document.documentElement.style.setProperty(
        "--main-width",
        `${mainWidth}vw`
      );
    }
  }, [isSettingsOpen, isMobile, mainWidth]);

  return (
    <Theme
      appearance={appearance}
      accentColor={color}
      scaling="110%"
      style={{ backgroundColor: "transparent" }}>
      <DynamicContent>
        <div
          className={`grid h-dvh transition-all duration-300 ${
            isSettingsOpen && !isMobile
              ? "grid-cols-[1fr_auto]"
              : "grid-cols-[1fr]"
          } overflow-hidden`}>
          <div className="flex flex-col text-sm flex-1 overflow-hidden">
            {siteStatus === "private-unauthenticated" ? (
              <>
                <Header
                  isPrivate={true}
                  setIsSettingsOpen={setIsSettingsOpen}
                />
                <div className="flex-1 min-h-0">
                  <Suspense fallback={<Loading />}>
                    <PrivatePage />
                  </Suspense>
                </div>
              </>
            ) : (
              <AppRoutes
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setIsSettingsOpen={setIsSettingsOpen}
              />
            )}
            <Footer />
          </div>
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </DynamicContent>
    </Theme>
  );
};

const AppProviders = ({
  siteStatus,
  children,
}: {
  siteStatus: SiteStatus;
  children: React.ReactNode;
}) => {
  if (siteStatus === "private-unauthenticated") {
    return <>{children}</>;
  }
  return (
    <NodeDataProvider>
      <LiveDataProvider>{children}</LiveDataProvider>
    </NodeDataProvider>
  );
};

const App = () => {
  const themeManager = useThemeManager();
  const { siteStatus } = useAppConfig();

  return (
    <ThemeProvider value={themeManager}>
      <AppProviders siteStatus={siteStatus}>
        <AppContent />
      </AppProviders>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <Router>
        <App />
      </Router>
    </ConfigProvider>
  </StrictMode>
);
