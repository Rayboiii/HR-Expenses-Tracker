-- Run this in SSMS (connect to localhost\SQLEXPRESS first)

CREATE DATABASE expense_tracker;
GO

USE expense_tracker;
GO

CREATE TABLE expenses (
  id            UNIQUEIDENTIFIER  DEFAULT NEWID() PRIMARY KEY,
  title         NVARCHAR(255)     NOT NULL,
  amount        DECIMAL(10, 2)    NOT NULL,
  category      NVARCHAR(50)      NOT NULL,
  date          DATE              NOT NULL,
  note          NVARCHAR(MAX),
  status        NVARCHAR(20)      NOT NULL DEFAULT 'personal',
  claim_note    NVARCHAR(MAX),
  receipt       NVARCHAR(MAX),    -- base64 image data URL
  submitted_by  NVARCHAR(255),
  created_at    DATETIME2         NOT NULL DEFAULT GETDATE(),
  updated_at    DATETIME2         NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE budgets (
  id            INT               IDENTITY(1,1) PRIMARY KEY,
  category      NVARCHAR(50)      NOT NULL UNIQUE,
  limit_amount  DECIMAL(10, 2)    NOT NULL
);
GO

CREATE TABLE policies (
  id            INT               IDENTITY(1,1) PRIMARY KEY,
  category      NVARCHAR(50)      NOT NULL UNIQUE,
  max_amount    DECIMAL(10, 2)    NOT NULL
);
GO

CREATE TABLE claim_history (
  id            INT               IDENTITY(1,1) PRIMARY KEY,
  expense_id    UNIQUEIDENTIFIER  NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  status        NVARCHAR(20)      NOT NULL,
  comment       NVARCHAR(MAX),
  created_at    DATETIME2         NOT NULL DEFAULT GETDATE()
);
GO
