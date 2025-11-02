import React from "react";
import { useLocale } from "@/config/hooks";
import { Card } from "../ui/card";

const Footer: React.FC = () => {
  const { t } = useLocale();
  return (
    <footer className="sticky bottom-0 left-0 right-0 flex z-10">
      <Card className="p-2 rounded-none w-full flex items-center justify-center inset-shadow-sm inset-shadow-(color:--accent-a4)">
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
      </Card>
    </footer>
  );
};

export default Footer;
