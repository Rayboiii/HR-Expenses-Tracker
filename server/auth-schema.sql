-- Run in SSMS against expense_tracker

USE expense_tracker;
GO

CREATE TABLE users (
  id            INT           IDENTITY(1,1) PRIMARY KEY,
  name          NVARCHAR(255) NOT NULL,
  email         NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role          NVARCHAR(20)  NOT NULL DEFAULT 'employee', -- 'employee' | 'manager'
  created_at    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- Link expenses to the user who created them
ALTER TABLE expenses ADD user_id INT NULL REFERENCES users(id);
GO
