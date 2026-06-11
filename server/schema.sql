-- ============================================================
-- HR Expenses Tracker — Full Database Setup
-- Run this once in SSMS connected to your SQL Server instance
-- ============================================================

CREATE DATABASE expense_tracker;
GO

USE expense_tracker;
GO

-- Users (authentication + roles)
CREATE TABLE users (
  id            INT           IDENTITY(1,1) PRIMARY KEY,
  name          NVARCHAR(255) NOT NULL,
  email         NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role          NVARCHAR(20)  NOT NULL DEFAULT 'employee', -- 'employee' | 'manager'
  created_at    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- Expenses
CREATE TABLE expenses (
  id            UNIQUEIDENTIFIER  DEFAULT NEWID() PRIMARY KEY,
  title         NVARCHAR(255)     NOT NULL,
  amount        DECIMAL(10, 2)    NOT NULL,
  category      NVARCHAR(50)      NOT NULL,
  date          DATE              NOT NULL,
  note          NVARCHAR(MAX),
  status        NVARCHAR(20)      NOT NULL DEFAULT 'personal',
  claim_note    NVARCHAR(MAX),
  receipt       NVARCHAR(MAX),
  submitted_by  NVARCHAR(255),
  user_id       INT               NULL REFERENCES users(id),
  created_at    DATETIME2         NOT NULL DEFAULT GETDATE(),
  updated_at    DATETIME2         NOT NULL DEFAULT GETDATE()
);
GO

-- Claim history / audit log
CREATE TABLE claim_history (
  id            INT               IDENTITY(1,1) PRIMARY KEY,
  expense_id    UNIQUEIDENTIFIER  NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  status        NVARCHAR(20)      NOT NULL,
  comment       NVARCHAR(MAX),
  created_at    DATETIME2         NOT NULL DEFAULT GETDATE()
);
GO

-- Monthly budgets (per employee, set by manager)
CREATE TABLE budgets (
  user_id       INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category      NVARCHAR(50)   NOT NULL,
  limit_amount  DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (user_id, category)
);
GO

-- Claim policies — max amount per category (per employee, set by manager)
CREATE TABLE policies (
  user_id    INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   NVARCHAR(50)   NOT NULL,
  max_amount DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (user_id, category)
);
GO
