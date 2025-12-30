# Expense Tracker Dashboard

A modern, full-stack expense tracking web application with AI-powered insights. Track your income and expenses across multiple months with beautiful visualizations, smart analytics, and intuitive data management.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![AI Powered](https://img.shields.io/badge/AI-Gemini-orange)

## ✨ Key Features

### 🔐 Authentication & Security

- **User Registration & Login** - Secure authentication with bcrypt password hashing
- **Password Change** - Update your password anytime from profile settings
- **Account Deletion** - Permanently delete account with all data (requires confirmation)
- **Multi-User Support** - Each user has isolated financial data
- **Protected Admin Account** - Demo admin account cannot be deleted or have password changed

### 💰 Financial Management

- **Multi-Period Tracking** - Track income and expenses across months and years
- **Entry-Based System** - Add multiple entries per category with detailed notes
- **Smart Grouping** - Automatic category grouping with breakdown views
- **Carry Forward** - Auto-calculated balance transfers between months
- **Need/Want/Neutral Tags** - Categorize expenses for better spending insights (🔴 Need, 🟡 Want, ⚪ Neutral)
- **Recurring Expenses** - Set up recurring expenses from profile settings

### 📊 Analytics & Visualizations

- **Expense Breakdown** - Interactive pie charts showing category-wise distribution
- **Income vs Expense** - Bar charts comparing monthly income and expenses
- **Need vs Want Analysis** - Visual breakdown of spending priorities
- **Carry Forward Trends** - Line charts tracking balance over time
- **Financial Summary Cards** - Quick overview of total income, expenses, and net balance

### 🤖 AI-Powered Insights

- **Financial Health Score** - AI-calculated score (0-100) based on your spending patterns
- **Smart Recommendations** - Personalized suggestions for budget optimization
- **Trend Analysis** - Month-over-month comparisons and predictions
- **Spending Patterns** - Automated detection of spending habits
- **24-Hour Caching** - Fast load times with intelligent cache management
- **Powered by Gemini 1.5 Flash** - Google's advanced AI for accurate financial analysis

### 🎨 User Experience

- **Dark Theme** - Beautiful, modern dark mode interface
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Toast Notifications** - Right-side floating notifications for all actions
- **Custom Confirmation Dialogs** - Elegant dialogs instead of browser alerts
- **Search & Filter** - Real-time search across categories and notes
- **Sortable Tables** - Click column headers to sort data
- **Interactive Tooltips** - Detailed transaction breakdowns on hover
- **Smooth Animations** - Polished transitions and loading states

### 🛠 Advanced Features

- **Currency Support** - INR and USD with easy switching
- **Profile Management** - Update display name and currency preferences
- **Edit Capabilities** - Modify individual entries (amount, note, tag)
- **Bulk Delete** - Remove entire categories with confirmation
- **Export Ready** - Structured data for future export features
- **Empty States** - Helpful guidance when no data exists

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- MongoDB Atlas account (free tier)
- Gemini API key (free from Google AI Studio)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd expense-tracker-dashboard
```

2. **Install dependencies**

```bash
yarn install
```

3. **Configure environment variables**

Create `server/.env`:

```env
DB_PASSWORD=your_mongodb_password
PORT=5001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash-latest
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

4. **Start the application**

```bash
yarn dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login

- **Username**: `admin`
- **Password**: `admin`

## 📖 Usage Guide

### Getting Started

1. **Login** with the default credentials or create a new account
2. **Create a Period** by clicking "Add Period" button
3. **Add Income** entries with categories and notes
4. **Add Expenses** with categories, notes, and Need/Want/Neutral tags
5. **View Analytics** through interactive charts and AI insights

### Managing Your Profile

- **Update Name**: Change your display name in profile settings
- **Change Currency**: Switch between INR and USD
- **Change Password**: Update your password securely (requires current password)
- **Manage Recurring Expenses**: Set up expenses that repeat monthly
- **Delete Account**: Permanently remove your account and all data (with confirmation)

### Using AI Insights

1. Navigate to Dashboard for **Overview Insights**

   - Financial health score
   - Key spending insights
   - Predictions and recommendations

2. Click on any month for **Monthly Insights**

   - Month-specific analysis
   - Comparisons with previous months
   - Actionable recommendations

3. Click **Refresh** to regenerate insights with latest data

### Advanced Features

- **Search**: Use the search bar to find specific transactions
- **Filter**: Filter expenses by Need/Want/Neutral tags
- **Sort**: Click table headers to sort by category or amount
- **Edit**: Click edit icon to modify individual entries
- **Delete**: Click delete icon with confirmation for safe removal

## 🏗️ Tech Stack

### Frontend

- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui components
- Chart.js for visualizations
- React Router for navigation
- Sonner for toast notifications

### Backend

- Node.js + Express + TypeScript
- MongoDB Atlas (cloud database)
- Mongoose ODM
- Google Gemini AI (1.5 Flash)
- bcrypt for password security
- Winston for logging

### Development

- Yarn workspaces (monorepo)
- ESLint for code quality
- Husky for pre-commit hooks
- Concurrent dev servers

## 📋 Default Categories

### Income

Salary • Carry Forward • Bonus • Freelance • Investment Returns • Rental Income • Others

### Expenses

Rent • EMIs • Groceries • Shopping • Food & Drinks • Credit Card • Bills & Utility • Transportation • Medical • Personal Care • Insurance • Investment • Miscellaneous

## 🔌 API Reference

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new account
- `POST /api/auth/change-password` - Change password
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account (with cascade)

### Data Management

- `GET /api/data` - Fetch all months
- `POST /api/data/month` - Create new period
- `POST /api/data/income/entry` - Add income entry
- `POST /api/data/expense/entry` - Add expense entry
- `PUT /api/data/income/entry/:id` - Update income entry
- `DELETE /api/data/expense/entry/:id` - Delete expense entry

### Recurring Expenses

- `GET /api/recurring` - List recurring expenses
- `POST /api/recurring` - Create recurring expense
- `PUT /api/recurring/:id` - Update recurring expense
- `DELETE /api/recurring/:id` - Delete recurring expense

### AI Insights

- `GET /api/insights/overview` - Dashboard insights
- `GET /api/insights/month/:id` - Monthly insights
- `POST /api/insights/regenerate/overview` - Refresh overview
- `POST /api/insights/regenerate/month/:id` - Refresh monthly

## 🎯 Roadmap

### Planned Features

- 📊 Budget planning with alerts
- 📅 Bill reminders and due dates
- 📁 Receipt attachments
- 📈 Year-over-year comparisons
- 💾 Data export (CSV/PDF)
- 📱 Mobile app (iOS/Android)
- 🔄 Bank integration
- 👥 Shared/Family accounts
- 🎮 Gamification (achievements, streaks)
- 🌐 Multi-currency with live conversion

## 💡 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - Copyright (c) 2025 Alok Raj

## 🙏 Credits

Built with:

- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Chart.js](https://www.chartjs.org/) - Data Visualizations
- [Lucide](https://lucide.dev/) - Icons
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Google Gemini](https://ai.google.dev/) - AI Insights

---

**Built with ❤️ by [Alok Raj](https://github.com/alok722)**

⭐ Star this repo if you find it helpful!
