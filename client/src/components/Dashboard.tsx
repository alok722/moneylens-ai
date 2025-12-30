import { useApp } from "@/context/AppContext";
import { DashboardSkeleton } from "./Skeletons/DashboardSkeleton";
import { OverviewInsightsCard } from "./AIInsights/OverviewInsightsCard";
import { DashboardSummaryCards } from "./Dashboard/DashboardSummaryCards";
import { MonthCreationDialog } from "./Dashboard/MonthCreationDialog";
import { YearSection } from "./Dashboard/YearSection";
import { Card, CardContent } from "@/components/ui/card";
import { useExport } from "@/hooks/useExport";
import { CalendarIcon } from "lucide-react";

export function Dashboard() {
  const { months, isLoading, createMonth, currency, user } = useApp();
  const { isExporting, exportYear } = useExport(currency);

  // Group months by year
  const monthsByYear = (months || []).reduce((acc, month) => {
    const year = month.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(month);
    return acc;
  }, {} as Record<number, typeof months>);

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(monthsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalIncome = (months || []).reduce((sum, m) => sum + m.totalIncome, 0);
  const totalExpense = (months || []).reduce(
    (sum, m) => sum + m.totalExpense,
    0
  );
  const netBalance = totalIncome - totalExpense;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <DashboardSummaryCards
        totalRecords={months.length}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
        currency={currency}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
          <p className="text-slate-400 mt-1">
            Track your income and expenses across months and years
          </p>
        </div>
        <MonthCreationDialog onCreateMonth={createMonth} />
      </div>

      {/* AI Insights Section */}
      {user && months.length > 0 && (
        <div className="mb-8">
          <OverviewInsightsCard userId={user.id} />
        </div>
      )}

      {/* Month Grid Grouped by Year */}
      {months.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No records yet
            </h3>
            <p className="text-slate-400 mb-4">
              Get started by adding your first period
            </p>
            <MonthCreationDialog onCreateMonth={createMonth} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <YearSection
              key={year}
              year={year}
              months={monthsByYear[year]}
              isExporting={isExporting}
              onExportYear={(yr) => exportYear(monthsByYear[yr], yr)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
