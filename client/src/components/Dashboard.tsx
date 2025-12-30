import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MonthCard } from "./MonthCard";
import { OverviewInsightsCard } from "./AIInsights/OverviewInsightsCard";
import { DashboardSkeleton } from "./Skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/calculations";
import { exportYearToExcel } from "@/utils/excelExport";
import { toast } from "sonner";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarIcon,
  Download,
  Loader2,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Dashboard() {
  const { months, isLoading, createMonth, currency, user } = useApp();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentMonth.toString()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleCreateMonth = async () => {
    if (!selectedYear || !selectedMonth) return;
    setIsCreating(true);
    setError("");
    try {
      await createMonth(parseInt(selectedYear), parseInt(selectedMonth));
      setDialogOpen(false);
      setSelectedYear(currentYear.toString());
      setSelectedMonth(currentMonth.toString());
    } catch (err: any) {
      setError(err.message || "Failed to create month");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportYear = async (year: number) => {
    const yearMonths = monthsByYear[year];
    if (!yearMonths || yearMonths.length === 0) {
      toast.error("No data to export for this year");
      return;
    }

    setIsExporting(true);
    try {
      const filename = await exportYearToExcel(yearMonths, year, currency);
      toast.success(`Excel file "${filename}" downloaded successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Records</p>
                <p className="text-2xl font-bold text-white">{months.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Income</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(totalIncome, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Expense</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(totalExpense, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  netBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}
              >
                <Wallet
                  className={`w-6 h-6 ${
                    netBalance >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-slate-400">Net Balance</p>
                <p
                  className={`text-2xl font-bold ${
                    netBalance >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(netBalance, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
          <p className="text-slate-400 mt-1">
            Track your income and expenses across months and years
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Select Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-slate-300">
                    Month
                  </Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {MONTHS.map((month, index) => (
                        <SelectItem
                          key={index}
                          value={index.toString()}
                          className="text-white focus:bg-slate-700 focus:text-white"
                        >
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-slate-300">
                    Year
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Array.from(
                        { length: 10 },
                        (_, i) => currentYear - 5 + i
                      ).map((year) => (
                        <SelectItem
                          key={year}
                          value={year.toString()}
                          className="text-white focus:bg-slate-700 focus:text-white"
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-center text-slate-300">
                Creating: {MONTHS[parseInt(selectedMonth)]} {selectedYear}
              </p>

              {error && (
                <p className="text-center text-red-400 text-sm">{error}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="text-slate-300">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleCreateMonth}
                disabled={isCreating || !selectedYear || !selectedMonth}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Period
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Period
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{year}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                <Button
                  onClick={() => handleExportYear(year)}
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
                {monthsByYear[year]
                  .sort((a, b) => a.month - b.month)
                  .map((month) => (
                    <MonthCard key={month._id} month={month} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
