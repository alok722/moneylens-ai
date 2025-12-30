import { SummaryCard } from "@/components/shared/SummaryCard";
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface DashboardSummaryCardsProps {
  totalRecords: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  currency: "USD" | "INR";
}

export function DashboardSummaryCards({
  totalRecords,
  totalIncome,
  totalExpense,
  netBalance,
  currency,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SummaryCard
        icon={CalendarIcon}
        label="Total Records"
        value={totalRecords}
        iconBgColor="bg-slate-700/50"
        iconColor="text-slate-300"
        valueColor="text-white"
      />

      <SummaryCard
        icon={TrendingUp}
        label="Total Income"
        value={formatCurrency(totalIncome, currency)}
        iconBgColor="bg-emerald-500/10"
        iconColor="text-emerald-400"
        valueColor="text-emerald-400"
      />

      <SummaryCard
        icon={TrendingDown}
        label="Total Expense"
        value={formatCurrency(totalExpense, currency)}
        iconBgColor="bg-red-500/10"
        iconColor="text-red-400"
        valueColor="text-red-400"
      />

      <SummaryCard
        icon={Wallet}
        label="Net Balance"
        value={formatCurrency(netBalance, currency)}
        iconBgColor={netBalance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        iconColor={netBalance >= 0 ? "text-emerald-400" : "text-red-400"}
        valueColor={netBalance >= 0 ? "text-emerald-400" : "text-red-400"}
      />
    </div>
  );
}

