import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { MONTHS } from "@/constants/months";

interface MonthCreationDialogProps {
  onCreateMonth: (year: number, month: number) => Promise<void>;
}

export function MonthCreationDialog({
  onCreateMonth,
}: MonthCreationDialogProps) {
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

  const handleCreateMonth = async () => {
    if (!selectedYear || !selectedMonth) return;
    setIsCreating(true);
    setError("");
    try {
      await onCreateMonth(parseInt(selectedYear), parseInt(selectedMonth));
      setDialogOpen(false);
      setSelectedYear(currentYear.toString());
      setSelectedMonth(currentMonth.toString());
    } catch (err: any) {
      setError(err.message || "Failed to create month");
    } finally {
      setIsCreating(false);
    }
  };

  return (
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
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(
                    (year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-center text-slate-300">
            Creating: {MONTHS[parseInt(selectedMonth)]} {selectedYear}
          </p>

          {error && <p className="text-center text-red-400 text-sm">{error}</p>}
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
  );
}

