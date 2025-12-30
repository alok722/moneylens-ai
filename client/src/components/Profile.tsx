import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ProfileInfoSection } from "./Profile/ProfileInfoSection";
import { SecuritySection } from "./Profile/SecuritySection";
import { AccountRecoverySection } from "./Profile/AccountRecoverySection";
import { RecurringExpensesSection } from "./Profile/RecurringExpensesSection";
import { DangerZoneSection } from "./Profile/DangerZoneSection";
import { ProfileDialogs } from "./Profile/ProfileDialogs";
import type { RecurringExpense } from "@/types";
import { toast } from "sonner";
import { getSecurityQuestion } from "@/services/api";

export function Profile() {
  const navigate = useNavigate();
  const {
    user,
    currency,
    updateProfile,
    changePassword,
    deleteAccount,
    recurringExpenses,
    deleteRecurringExpense,
    updateRecurringExpense,
    updateSecurityQuestion,
  } = useApp();

  const [isLoadingRecurringExpenses, setIsLoadingRecurringExpenses] =
    useState(true);

  // Security question state
  const [securityQuestionDialogOpen, setSecurityQuestionDialogOpen] =
    useState(false);
  const [currentSecurityQuestion, setCurrentSecurityQuestion] =
    useState<string>("");
  const [newSecurityQuestion, setNewSecurityQuestion] = useState<string>("");
  const [newSecurityAnswer, setNewSecurityAnswer] = useState<string>("");
  const [securityPassword, setSecurityPassword] = useState<string>("");
  const [loadingSecurityQuestion, setLoadingSecurityQuestion] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // Edit recurring expense state
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    category: "",
    amount: 0,
    note: "",
    tag: "neutral" as "need" | "want" | "neutral",
  });

  // Check if current user is admin
  const isAdminUser = user?.username?.toLowerCase() === "admin";

  // Load recurring expenses on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingRecurringExpenses(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenSecurityDialog = async () => {
    if (!user?.username) return;

    setLoadingSecurityQuestion(true);
    try {
      const result = await getSecurityQuestion(user.username);
      if (result.question) {
        setCurrentSecurityQuestion(result.question);
        setNewSecurityQuestion(result.question);
      }
      setSecurityQuestionDialogOpen(true);
    } catch {
      toast.error("Failed to load security question");
    } finally {
      setLoadingSecurityQuestion(false);
    }
  };

  const handleUpdateSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSecurityQuestion) {
      toast.error("Please select a security question");
      return;
    }

    if (newSecurityAnswer.length < 3) {
      toast.error("Answer must be at least 3 characters");
      return;
    }

    if (!securityPassword) {
      toast.error("Current password is required");
      return;
    }

    setIsUpdatingSecurity(true);
    try {
      await updateSecurityQuestion(
        securityPassword,
        newSecurityQuestion,
        newSecurityAnswer
      );
      setSecurityQuestionDialogOpen(false);
      setNewSecurityAnswer("");
      setSecurityPassword("");
    } catch {
      // Error already handled by context
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleEditClick = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setEditForm({
      category: expense.category,
      amount: expense.amount,
      note: expense.note,
      tag: expense.tag,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingExpense) return;

    try {
      await updateRecurringExpense(editingExpense._id, editForm);
      setEditingExpense(null);
    } catch {
      toast.error("Failed to update. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </div>

      <ProfileInfoSection
        username={user.username}
        name={user.name || user.username}
        currency={currency}
        onUpdateProfile={updateProfile}
      />

      <SecuritySection
        isAdminUser={isAdminUser}
        onChangePassword={changePassword}
      />

      <AccountRecoverySection
        isAdminUser={isAdminUser}
        isLoading={loadingSecurityQuestion}
        onOpenDialog={handleOpenSecurityDialog}
      />

      <RecurringExpensesSection
        recurringExpenses={recurringExpenses}
        currency={currency}
        isLoading={isLoadingRecurringExpenses}
        onDelete={(id) => deleteRecurringExpense(id)}
        onEdit={handleEditClick}
      />

      <DangerZoneSection
        isAdminUser={isAdminUser}
        username={user.username}
        onDeleteAccount={deleteAccount}
        onNavigateHome={() => navigate("/")}
      />

      <ProfileDialogs
        securityQuestionDialogOpen={securityQuestionDialogOpen}
        setSecurityQuestionDialogOpen={setSecurityQuestionDialogOpen}
        currentSecurityQuestion={currentSecurityQuestion}
        newSecurityQuestion={newSecurityQuestion}
        setNewSecurityQuestion={setNewSecurityQuestion}
        newSecurityAnswer={newSecurityAnswer}
        setNewSecurityAnswer={setNewSecurityAnswer}
        securityPassword={securityPassword}
        setSecurityPassword={setSecurityPassword}
        isUpdatingSecurity={isUpdatingSecurity}
        onUpdateSecurityQuestion={handleUpdateSecurityQuestion}
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
        editForm={editForm}
        setEditForm={setEditForm}
        onEditSubmit={handleEditSubmit}
      />
    </div>
  );
}
