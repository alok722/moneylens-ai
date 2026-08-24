import { useApp } from "@/context/AppContext";
import { DashboardSkeleton } from "./Skeletons/DashboardSkeleton";
import { OverviewInsightsCard } from "./AIInsights/OverviewInsightsCard";

import { MonthCreationDialog } from "./Dashboard/MonthCreationDialog";
import { YearSection } from "./Dashboard/YearSection";
import { Card, CardContent } from "@/components/ui/card";
import { useExport } from "@/hooks/useExport";
import { CalendarIcon, Activity, BarChart3 } from "lucide-react";
import { useMemo } from "react";

export function Dashboard() {
  const { months, isLoading, createMonth, currency, user } = useApp();
  const { isExporting, exportYear } = useExport(currency);

  const monthsByYear = (months || []).reduce((acc, month) => {
    const year = month.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(month);
    return acc;
  }, {} as Record<number, typeof months>);

  const sortedYears = Object.keys(monthsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalIncome = (months || []).reduce((sum, m) => {
    const pureIncome = (m.income || [])
      .filter((inc) => inc.category !== "Carry Forward")
      .reduce((incSum, inc) => incSum + inc.amount, 0);
    return sum + pureIncome;
  }, 0);
  const totalExpense = (months || []).reduce(
    (sum, m) => sum + m.totalExpense,
    0
  );


  const advancedMetrics = useMemo(() => {
    if (months.length === 0) return null;
    
    const sortedMonths = [...months].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const avgIncome = totalIncome / months.length;
    const avgExpense = totalExpense / months.length;
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    const recentMonths = sortedMonths.slice(-3);
    const previousMonths = sortedMonths.slice(-6, -3);
    
    const getPureIncome = (m: any) => (m.income || [])
      .filter((inc: any) => inc.category !== "Carry Forward")
      .reduce((incSum: any, inc: any) => incSum + inc.amount, 0);

    const recentAvgIncome = recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + getPureIncome(m), 0) / recentMonths.length
      : 0;
    const previousAvgIncome = previousMonths.length > 0
      ? previousMonths.reduce((sum, m) => sum + getPureIncome(m), 0) / previousMonths.length
      : 0;
    
    const incomeGrowth = previousAvgIncome > 0
      ? ((recentAvgIncome - previousAvgIncome) / previousAvgIncome) * 100
      : 0;

    return {
      avgIncome,
      avgExpense,
      savingsRate,
      incomeGrowth,
      totalMonths: months.length,
    };
  }, [months, totalIncome, totalExpense]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-start gap-2 sm:items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg backdrop-blur-sm border border-blue-400/30 flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-words">
                    Financial Command Center
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2 mt-1">
                    <Activity className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">Real-time insights into your financial health</span>
                  </p>
                </div>
              </div>
              
              {advancedMetrics && (
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <div className="px-3 py-1 bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 whitespace-nowrap">
                    <span className="text-slate-400">Period: </span>
                    <span className="text-white font-semibold">{advancedMetrics.totalMonths} months</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 backdrop-blur-sm rounded-lg border border-emerald-500/30 whitespace-nowrap">
                    <span className="text-emerald-300">Savings: </span>
                    <span className="text-emerald-400 font-semibold">{advancedMetrics.savingsRate.toFixed(1)}%</span>
                  </div>
                  {advancedMetrics.incomeGrowth !== 0 && (
                    <div className={`px-3 py-1 backdrop-blur-sm rounded-lg border whitespace-nowrap ${
                      advancedMetrics.incomeGrowth > 0 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-orange-500/10 border-orange-500/30'
                    }`}>
                      <span className={advancedMetrics.incomeGrowth > 0 ? 'text-blue-300' : 'text-orange-300'}>
                        Trend: 
                      </span>
                      <span className={`font-semibold ml-1 ${
                        advancedMetrics.incomeGrowth > 0 ? 'text-blue-400' : 'text-orange-400'
                      }`}>
                        {advancedMetrics.incomeGrowth > 0 ? '+' : ''}{advancedMetrics.incomeGrowth.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 sm:self-start">
              <MonthCreationDialog onCreateMonth={createMonth} />
            </div>
          </div>
        </div>
      </div>



      {user && months.length > 0 && (
        <div className="animate-fade-in">
          <OverviewInsightsCard userId={user.id} />
        </div>
      )}

      {months.length === 0 ? (
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 border-2 border-dashed shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
              <CalendarIcon className="relative w-20 h-20 text-slate-500 mb-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Start Your Financial Journey
            </h3>
            <p className="text-slate-400 mb-6 text-center max-w-md">
              Begin tracking your income and expenses to unlock powerful insights and achieve your financial goals
            </p>
            <MonthCreationDialog onCreateMonth={createMonth} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedYears.map((year, idx) => (
            <div key={year} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <YearSection
                year={year}
                months={monthsByYear[year]}
                isExporting={isExporting}
                onExportYear={(yr) => exportYear(monthsByYear[yr], yr)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
