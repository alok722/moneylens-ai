import { MonthCard } from "@/components/MonthCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthTrendChart } from "@/components/Charts/MonthTrendChart";
import { CarryForwardTrendChart } from "@/components/Charts/CarryForwardTrendChart";
import { InvestmentTrendChart } from "@/components/Charts/InvestmentTrendChart";
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
    <div className="space-y-6">
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

      {/* Month Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months
          .sort((a, b) => a.month - b.month)
          .map((month) => (
            <MonthCard key={month._id} month={month} />
          ))}
      </div>

      {/* Trend Charts for the Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Month-over-Month Trends
            </h3>
            <MonthTrendChart months={months} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Carry Forward Trend
            </h3>
            <CarryForwardTrendChart months={months} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Investment Trend
            </h3>
            <InvestmentTrendChart months={months} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

