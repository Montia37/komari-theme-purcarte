import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed inset-shadow-sm bottom-0 left-0 right-0 p-2 text-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-t border-white/20 dark:border-white/10 z-50">
      <p className="flex justify-center text-sm text-gray-700 dark:text-gray-200 text-shadow-lg whitespace-pre">
        Powered by{" "}
        <a
          href="https://github.com/komari-monitor/komari"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          Komari Monitor
        </a>
        {" | "}
        Theme by{" "}
        <a
          href="https://github.com/Montia37/komari-theme-purcarte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          PurCarte
        </a>
      </p>
    </footer>
  );
};

export default Footer;
