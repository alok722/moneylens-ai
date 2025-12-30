import { MonthCard } from "@/components/MonthCard";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { MonthData } from "@/types";

interface YearSectionProps {
  year: number;
  months: MonthData[];
  isExporting: boolean;
  onExportYear: (year: number) => void;
}

export function YearSection({
  year,
  months,
  isExporting,
  onExportYear,
}: YearSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">{year}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
        <Button
          onClick={() => onExportYear(year)}
          disabled={isExporting}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export {year}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months
          .sort((a, b) => a.month - b.month)
          .map((month) => (
            <MonthCard key={month._id} month={month} />
          ))}
      </div>
    </div>
  );
}

