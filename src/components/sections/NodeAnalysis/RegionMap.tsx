import { Card } from "@/components/ui/card";
import { useLocale } from "@/config/hooks";

export const RegionMap = () => {
  const { t } = useLocale();
  return (
    <Card className="p-4 flex items-center justify-center">
      {t("analysis.regionMap")}
    </Card>
  );
};
