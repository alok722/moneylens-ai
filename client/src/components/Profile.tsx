import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  User,
  Loader2,
  CheckCircle2,
  Trash2,
  Pencil,
  Lock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import type { RecurringExpense } from "@/types";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/Tables/CategoryIcon";
import { getSecurityQuestion } from "@/services/api";

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite movie?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
  "What is your favorite book?",
];

const EXPENSE_CATEGORIES = [
  "Rent",
  "EMIs",
  "Groceries",
  "Shopping",
  "Food & Drinks",
  "Credit Card",
  "Bills & Utility",
  "Transportation",
  "Medical",
  "Personal Care",
  "Entertainment",
  "Insurance",
  "Investment",
  "Miscellaneous",
];

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
  const [name, setName] = useState(user?.name || user?.username || "");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">(
    currency
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Security question state
  const [securityQuestionDialogOpen, setSecurityQuestionDialogOpen] = useState(false);
  const [currentSecurityQuestion, setCurrentSecurityQuestion] = useState<string>("");
  const [newSecurityQuestion, setNewSecurityQuestion] = useState<string>("");
  const [newSecurityAnswer, setNewSecurityAnswer] = useState<string>("");
  const [securityPassword, setSecurityPassword] = useState<string>("");
  const [loadingSecurityQuestion, setLoadingSecurityQuestion] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // Account deletion state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Check if current user is admin
  const isAdminUser = user?.username?.toLowerCase() === "admin";

  // Confirmation dialog for recurring expense deletion
  const [recurringDeleteDialog, setRecurringDeleteDialog] = useState<{
    open: boolean;
    expense: RecurringExpense | null;
  }>({ open: false, expense: null });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await updateProfile(name, selectedCurrency);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (_err) {
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecurring = async (expense: RecurringExpense) => {
    try {
      await deleteRecurringExpense(expense._id);
      toast.success(`Recurring expense "${expense.category}" deleted`);
      setRecurringDeleteDialog({ open: false, expense: null });
    } catch (error) {
      console.error("Failed to delete recurring expense:", error);
      toast.error("Failed to delete. Please try again.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Error already shown in toast by context
    } finally {
      setIsChangingPassword(false);
    }
  };

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
    } catch (error) {
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
      await updateSecurityQuestion(securityPassword, newSecurityQuestion, newSecurityAnswer);
      setSecurityQuestionDialogOpen(false);
      setNewSecurityAnswer("");
      setSecurityPassword("");
    } catch (error) {
      // Error already handled by context
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmUsername !== user?.username) {
      toast.error("Username does not match");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      // Error already shown in toast by context
      setIsDeletingAccount(false);
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
    } catch (error) {
      console.error("Failed to update recurring expense:", error);
      alert("Failed to update. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your display name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={user?.username || ""}
                disabled
                className="bg-slate-900/50 border-slate-600 text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Username cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Display Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="currency"
                className="text-slate-300 flex items-center gap-2"
              >
                Default Currency
              </Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value: "USD" | "INR") =>
                  setSelectedCurrency(value)
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="INR" className="text-white">
                    ₹ Indian Rupees (INR)
                  </SelectItem>
                  <SelectItem value="USD" className="text-white">
                    $ US Dollars (USD)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                This will be used throughout the application for displaying
                amounts
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully!
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security - Password Change */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription className="text-slate-400">
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdminUser && (
            <div className="mb-4 rounded-lg bg-amber-900/20 border border-amber-600/30 p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Password change is disabled for the admin account for demo
                purposes.
              </p>
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-300">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isAdminUser}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isAdminUser}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isAdminUser}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isChangingPassword || isAdminUser}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Question - Account Recovery */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Account Recovery
          </CardTitle>
          <CardDescription className="text-slate-400">
            Security question for password recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdminUser ? (
            <>
              <div className="rounded-lg bg-emerald-900/20 border border-emerald-600/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">
                      Security Question Configured
                    </p>
                    <p className="text-sm text-emerald-200/80 mt-1">
                      Your security question can be used to reset your password if you forget it.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenSecurityDialog}
                disabled={loadingSecurityQuestion}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                {loadingSecurityQuestion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Change Security Question"
                )}
              </Button>
            </>
          ) : (
            <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Security questions are not available for the admin account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Expenses Section */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recurring Expenses</CardTitle>
          <CardDescription className="text-slate-400">
            These expenses will be automatically added when you create a new
            month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recurringExpenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No recurring expenses yet. Mark an expense as recurring when
              creating it.
            </div>
          ) : (
            <div className="space-y-2">
              {recurringExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {expense.category}
                      </span>
                      <span className="text-xs">
                        {expense.tag === "need"
                          ? "🔴"
                          : expense.tag === "want"
                          ? "🟡"
                          : "⚪"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {expense.note}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-red-400">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(expense)}
                      className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setRecurringDeleteDialog({ open: true, expense })
                      }
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">
                    Total recurring per month:
                  </span>
                  <span className="font-bold text-red-400 text-lg">
                    {formatCurrency(
                      (recurringExpenses || []).reduce(
                        (sum, e) => sum + e.amount,
                        0
                      ),
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone - Account Deletion */}
      <Card className="bg-red-950/20 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-300/70">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdminUser && (
            <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-3 flex items-start gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Account deletion is disabled for the admin account to prevent
                accidental removal of the demo account.
              </p>
            </div>
          )}
          <div
            className={`rounded-lg border border-red-900/30 bg-red-950/30 p-4 ${
              isAdminUser ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-red-300/70">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isAdminUser}
                className="bg-red-600 hover:bg-red-700 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Expense Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={recurringDeleteDialog.open}
        onOpenChange={(open) =>
          setRecurringDeleteDialog({
            open,
            expense: recurringDeleteDialog.expense,
          })
        }
        title="Delete Recurring Expense"
        description={`Are you sure you want to delete the recurring expense "${recurringDeleteDialog.expense?.category}"? This will not affect existing month entries.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (recurringDeleteDialog.expense) {
            handleDeleteRecurring(recurringDeleteDialog.expense);
          }
        }}
      />

      {/* Account Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-900/50 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Account - This Action is IRREVERSIBLE
            </DialogTitle>
            <DialogDescription className="text-slate-300 space-y-2">
              <p className="font-bold text-red-400">
                WARNING: This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your month data and transactions</li>
                <li>All recurring expenses</li>
                <li>All AI insights</li>
                <li>Your user account</li>
              </ul>
              <p className="text-red-300 font-semibold mt-3">
                This action cannot be undone!
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-slate-300">
                Confirm Your Password
              </Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-slate-300">
                Type your username to confirm:{" "}
                <span className="font-mono text-white">{user?.username}</span>
              </Label>
              <Input
                id="delete-confirm"
                type="text"
                placeholder="Type your username"
                value={deleteConfirmUsername}
                onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePassword("");
                setDeleteConfirmUsername("");
              }}
              disabled={isDeletingAccount}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={
                isDeletingAccount ||
                !deletePassword ||
                deleteConfirmUsername !== user?.username
              }
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Recurring Expense Dialog */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Recurring Expense</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the details of this recurring expense
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-slate-300">
                Category
              </Label>
              <Select
                value={editForm.category}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, category: value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-white focus:bg-slate-700 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat} type="expense" className="w-4 h-4" />
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-slate-300">
                Amount
              </Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: Number(e.target.value) })
                }
                className="bg-slate-900/50 border-slate-600 text-white"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note" className="text-slate-300">
                Note
              </Label>
              <Input
                id="edit-note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
                className="bg-slate-900/50 border-slate-600 text-white"
                placeholder="Add a note"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tag" className="text-slate-300">
                Tag
              </Label>
              <Select
                value={editForm.tag}
                onValueChange={(value: "need" | "want" | "neutral") =>
                  setEditForm({ ...editForm, tag: value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="need" className="text-white">
                    🔴 Need
                  </SelectItem>
                  <SelectItem value="want" className="text-white">
                    🟡 Want
                  </SelectItem>
                  <SelectItem value="neutral" className="text-white">
                    ⚪ Neutral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditingExpense(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Question Update Dialog */}
      <Dialog open={securityQuestionDialogOpen} onOpenChange={setSecurityQuestionDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Change Security Question
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update your security question and answer for account recovery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSecurityQuestion}>
            {/* Warning Banner */}
            <div className="rounded-lg bg-amber-900/20 border border-amber-600/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-200">🔐 Important:</p>
                  <p className="text-sm text-amber-200/90">
                    Changing your security question requires your current password for verification. Make sure to remember your new answer!
                  </p>
                </div>
              </div>
            </div>

            {currentSecurityQuestion && (
              <div className="rounded-lg bg-slate-700/30 border border-slate-600/50 p-3 mb-4">
                <Label className="text-xs text-slate-400">Current Question</Label>
                <p className="text-sm text-slate-300 mt-1">{currentSecurityQuestion}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-security-question" className="text-slate-300">
                  New Security Question *
                </Label>
                <Select value={newSecurityQuestion} onValueChange={setNewSecurityQuestion}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {SECURITY_QUESTIONS.map((q) => (
                      <SelectItem key={q} value={q} className="text-white focus:bg-slate-700 focus:text-white">
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-security-answer" className="text-slate-300">
                  Your Answer * <span className="text-xs text-slate-500">(min. 3 characters)</span>
                </Label>
                <Input
                  id="new-security-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={newSecurityAnswer}
                  onChange={(e) => setNewSecurityAnswer(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-slate-500">
                  Answers are not case-sensitive. Keep it simple and memorable.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-current-password" className="text-slate-300">
                  Current Password *
                </Label>
                <Input
                  id="security-current-password"
                  type="password"
                  placeholder="Enter your current password"
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSecurityQuestionDialogOpen(false);
                  setNewSecurityAnswer("");
                  setSecurityPassword("");
                }}
                disabled={isUpdatingSecurity}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingSecurity}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
              >
                {isUpdatingSecurity ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Security Question"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
