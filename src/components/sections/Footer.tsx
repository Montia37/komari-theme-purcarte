import React from "react";
import { useLocale } from "@/config/hooks";
import { Card } from "../ui/card";
import { useAppConfig } from "@/config/hooks";

const Footer: React.FC = () => {
  const { t } = useLocale();
  const { enableLiquidGlassEffect } = useAppConfig();
  return (
    <Card className={!enableLiquidGlassEffect ? "rounded-none" : ""}>
      <footer className="p-2 inset-shadow-sm inset-shadow-(color:--accent-a4) sticky bottom-0 flex items-center justify-center z-10">
        <p className="flex justify-center text-sm text-secondary-foreground theme-text-shadow whitespace-pre">
          {t("footer.poweredBy")}{" "}
          <a
            href="https://github.com/komari-monitor/komari"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors">
            Komari Monitor
          </a>
          {" | "}
          {t("footer.themeBy")}{" "}
          <a
            href="https://github.com/Montia37/komari-theme-purcarte"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors">
            PurCarte
          </a>
        </p>
      </footer>
    </Card>
  );
};

export default Footer;
