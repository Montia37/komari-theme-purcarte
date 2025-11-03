"use client";

import { useTheme } from "@/hooks/useTheme";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { appearance = "system" } = useTheme();

  return (
    <Sonner
      theme={appearance as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast purcarte-blur theme-card-style !text-foreground !text-sm",
          description: "text-secondary-foreground",
          actionButton:
            "theme-button !text-primary !text-sm inset-shadow-xs inset-shadow-(color:--accent-a4)",
          cancelButton:
            "theme-button-ghost !text-secondary-foreground !text-sm inset-shadow-xs inset-shadow-(color:--accent-a4)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
