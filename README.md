# HR Expenses Tracker

An expense management app built with Nuxt 4, Nuxt UI v3, and MSSQL. Employees can submit expense claims; managers can review, approve, and set per-employee budgets and policies.

## Features

- Employee and manager roles
- Expense tracking with category breakdowns and budget progress
- Claim submission with receipts, justification notes, and audit history
- Per-employee monthly budgets and claim policies set by managers
- Manager dashboard with employee switcher

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or any SQL Server edition)
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup) to run the setup script

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rayboiii/HR-Expenses-Tracker.git
cd HR-Expenses-Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Open SSMS, connect to your SQL Server instance, then open and run `server/schema.sql`. This creates the `expense_tracker` database and all required tables.

> **SQL Server tip:** Make sure TCP/IP is enabled in SQL Server Configuration Manager and the SQL Server Browser service is running.

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=expense_tracker
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
NUXT_SESSION_PASSWORD=any_long_random_string_at_least_32_chars
```

> **SQL Server auth:** The app uses SQL authentication (username + password), not Windows authentication. In SSMS, make sure Mixed Mode authentication is enabled and you have a SQL login created.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Register accounts

- Go to `/register` and create a **manager** account first
- Register additional **employee** accounts
- Log in as the manager — you will be prompted to select an employee to view

## Project Structure

```
app/
  components/       # Reusable Vue components
  composables/      # useExpenses, useBudgets, usePolicies, useUsers, useSelectedEmployee
  layouts/          # Default layout (navbar, employee context bar)
  middleware/       # Global auth + employee-selection guard
  pages/            # Routes: /, /expenses, /budgets, /claims, /select-employee, /login, /register
  types/            # TypeScript interfaces
  utils/            # formatCurrency, formatDate
server/
  api/              # REST endpoints (expenses, budgets, policies, users, auth)
  middleware/       # Server-side auth guard
  utils/            # DB connection pool, requireManager helper
  schema.sql        # Full database setup script
```
