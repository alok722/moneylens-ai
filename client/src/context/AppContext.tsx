import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AuthUser, MonthData, RecurringExpense } from "@/types";
import * as api from "@/services/api";
import { toast } from "sonner";

interface AppContextType {
  user: AuthUser | null;
  months: MonthData[];
  isLoading: boolean;
  error: string | null;
  currency: "USD" | "INR";
  recurringExpenses: RecurringExpense[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name?: string, currency?: "USD" | "INR") => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addIncome: (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  addIncomeEntry: (
    monthId: string,
    category: string,
    amount: number,
    note: string
  ) => Promise<void>;
  editIncome: (
    incomeId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  editIncomeEntry: (
    entryId: string,
    monthId: string,
    amount: number,
    note: string
  ) => Promise<void>;
  deleteIncome: (incomeId: string, monthId: string) => Promise<void>;
  deleteIncomeEntry: (entryId: string, monthId: string) => Promise<void>;
  addExpense: (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  addExpenseEntry: (
    monthId: string,
    category: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => Promise<void>;
  editExpense: (
    expenseId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => Promise<void>;
  editExpenseEntry: (
    entryId: string,
    monthId: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => Promise<void>;
  deleteExpense: (expenseId: string, monthId: string) => Promise<void>;
  deleteExpenseEntry: (entryId: string, monthId: string) => Promise<void>;
  createMonth: (year: number, month: number) => Promise<void>;
  fetchRecurringExpenses: () => Promise<void>;
  createRecurringExpense: (
    category: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  updateRecurringExpense: (
    id: string,
    updates: { category?: string; amount?: number; note?: string; tag?: string }
  ) => Promise<void>;
  setSecurityQuestion: (question: string, answer: string) => Promise<void>;
  updateSecurityQuestion: (
    currentPassword: string,
    question: string,
    answer: string
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_STORAGE_KEY = "expense-tracker-user";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [months, setMonths] = useState<MonthData[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update currency when user changes
  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchMonthsData(user.id);
      setMonths(data);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  useEffect(() => {
    if (user) {
      fetchRecurringExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.login(username, password);
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      return true;
    } catch (_err) {
      setError("Invalid credentials");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.register(username, password, name);
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name?: string, currency?: "USD" | "INR") => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await api.updateProfile(user.id, name, currency);
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      if (currency) {
        setCurrency(currency);
      }
    } catch (err) {
      setError("Failed to update profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user) return;
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      toast.success("Password changed successfully");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to change password";
      toast.error(errorMsg);
      throw err;
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user) return;
    try {
      await api.deleteAccount(user.id, password);
      toast.success("Account deleted successfully");
      logout();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete account";
      toast.error(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setMonths([]);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateMonthInState = (updatedMonth: MonthData) => {
    setMonths((prev) =>
      prev.map((m) => (m._id === updatedMonth._id ? updatedMonth : m))
    );
  };

  const addIncome = async (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => {
    try {
      const updatedMonth = await api.addIncome(
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to add income");
      throw err;
    }
  };

  const addIncomeEntry = async (
    monthId: string,
    category: string,
    amount: number,
    note: string
  ) => {
    try {
      const updatedMonth = await api.addIncomeEntry(
        monthId,
        category,
        amount,
        note
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to add income entry");
      throw err;
    }
  };

  const editIncome = async (
    incomeId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => {
    try {
      const updatedMonth = await api.editIncome(
        incomeId,
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to edit income");
      throw err;
    }
  };

  const deleteIncome = async (incomeId: string, monthId: string) => {
    try {
      const updatedMonth = await api.deleteIncome(incomeId, monthId);
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to delete income");
      throw err;
    }
  };

  const editIncomeEntry = async (
    entryId: string,
    monthId: string,
    amount: number,
    note: string
  ) => {
    try {
      const updatedMonth = await api.editIncomeEntry(
        entryId,
        monthId,
        amount,
        note
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to edit income entry");
      throw err;
    }
  };

  const deleteIncomeEntry = async (entryId: string, monthId: string) => {
    try {
      const updatedMonth = await api.deleteIncomeEntry(entryId, monthId);
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to delete income entry");
      throw err;
    }
  };

  const addExpense = async (
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => {
    try {
      const updatedMonth = await api.addExpense(
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to add expense");
      throw err;
    }
  };

  const addExpenseEntry = async (
    monthId: string,
    category: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => {
    try {
      const updatedMonth = await api.addExpenseEntry(
        monthId,
        category,
        amount,
        note,
        tag
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to add expense entry");
      throw err;
    }
  };

  const editExpense = async (
    expenseId: string,
    monthId: string,
    category: string,
    amount: number,
    comment: string
  ) => {
    try {
      const updatedMonth = await api.editExpense(
        expenseId,
        monthId,
        category,
        amount,
        comment
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to edit expense");
      throw err;
    }
  };

  const deleteExpense = async (expenseId: string, monthId: string) => {
    try {
      const updatedMonth = await api.deleteExpense(expenseId, monthId);
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to delete expense");
      throw err;
    }
  };

  const editExpenseEntry = async (
    entryId: string,
    monthId: string,
    amount: number,
    note: string,
    tag?: "need" | "want" | "neutral"
  ) => {
    try {
      const updatedMonth = await api.editExpenseEntry(
        entryId,
        monthId,
        amount,
        note,
        tag
      );
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to edit expense entry");
      throw err;
    }
  };

  const deleteExpenseEntry = async (entryId: string, monthId: string) => {
    try {
      const updatedMonth = await api.deleteExpenseEntry(entryId, monthId);
      updateMonthInState(updatedMonth);
    } catch (err) {
      setError("Failed to delete expense entry");
      throw err;
    }
  };

  const createMonth = async (year: number, month: number) => {
    if (!user) return;
    try {
      const newMonth = await api.createMonth(user.id, year, month);
      setMonths((prev) => [...prev, newMonth]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to create month";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const fetchRecurringExpenses = async () => {
    if (!user) return;
    try {
      const data = await api.fetchRecurringExpenses(user.id);
      setRecurringExpenses(data);
    } catch (err) {
      console.error("Failed to fetch recurring expenses", err);
    }
  };

  const createRecurringExpense = async (
    category: string,
    amount: number,
    note: string,
    tag: "need" | "want" | "neutral"
  ) => {
    if (!user) return;
    try {
      const newRecurring = await api.createRecurringExpense(
        user.id,
        category,
        amount,
        note,
        tag
      );
      setRecurringExpenses((prev) => [...prev, newRecurring]);
    } catch (err) {
      setError("Failed to create recurring expense");
      throw err;
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    try {
      await api.deleteRecurringExpense(id);
      setRecurringExpenses((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError("Failed to delete recurring expense");
      throw err;
    }
  };

  const updateRecurringExpense = async (
    id: string,
    updates: { category?: string; amount?: number; note?: string; tag?: string }
  ) => {
    try {
      const updated = await api.updateRecurringExpense(id, updates);
      setRecurringExpenses((prev) =>
        prev.map((r) => (r._id === id ? updated : r))
      );
    } catch (err) {
      setError("Failed to update recurring expense");
      throw err;
    }
  };

  const setSecurityQuestion = async (question: string, answer: string) => {
    if (!user) return;
    try {
      await api.setSecurityQuestion(user.id, question, answer);
      toast.success("Security question set successfully");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to set security question";
      toast.error(errorMsg);
      throw err;
    }
  };

  const updateSecurityQuestion = async (
    currentPassword: string,
    question: string,
    answer: string
  ) => {
    if (!user) return;
    try {
      await api.updateSecurityQuestion(user.id, currentPassword, question, answer);
      toast.success("Security question updated successfully");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to update security question";
      toast.error(errorMsg);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        months,
        isLoading,
        error,
        currency,
        recurringExpenses,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        refreshData,
        addIncome,
        addIncomeEntry,
        editIncome,
        editIncomeEntry,
        deleteIncome,
        deleteIncomeEntry,
        addExpense,
        addExpenseEntry,
        editExpense,
        editExpenseEntry,
        deleteExpense,
        deleteExpenseEntry,
        createMonth,
        fetchRecurringExpenses,
        createRecurringExpense,
        deleteRecurringExpense,
        updateRecurringExpense,
        setSecurityQuestion,
        updateSecurityQuestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
