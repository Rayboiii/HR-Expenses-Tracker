export type Category =
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'other'

export type ClaimStatus = 'personal' | 'pending' | 'approved' | 'reimbursed' | 'rejected'

export const CLAIM_STATUSES: {
  value: ClaimStatus
  label: string
  color: 'neutral' | 'warning' | 'info' | 'success' | 'error'
  icon: string
  next?: ClaimStatus
  nextLabel?: string
}[] = [
  { value: 'personal',   label: 'Personal',   color: 'neutral', icon: 'i-heroicons-user' },
  { value: 'pending',    label: 'Pending',     color: 'warning', icon: 'i-heroicons-clock',       next: 'approved',    nextLabel: 'Approve'          },
  { value: 'approved',   label: 'Approved',    color: 'info',    icon: 'i-heroicons-check-badge',  next: 'reimbursed',  nextLabel: 'Mark Reimbursed'  },
  { value: 'reimbursed', label: 'Reimbursed',  color: 'success', icon: 'i-heroicons-banknotes' },
  { value: 'rejected',   label: 'Rejected',    color: 'error',   icon: 'i-heroicons-x-circle',    next: 'pending',     nextLabel: 'Resubmit'         },
]

export interface ClaimHistoryEntry {
  status: ClaimStatus
  timestamp: string  // ISO datetime
  comment?: string   // optional approver/rejector note
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: Category
  date: string // ISO date string YYYY-MM-DD
  note?: string
  status?: ClaimStatus
  claimNote?: string
  receipt?: string
  submittedBy?: string
  userId?: number
  claimHistory?: readonly ClaimHistoryEntry[]
}

export interface ExpenseForm {
  title: string
  amount: number | null
  category: Category
  date: string
  note?: string
}

export interface Budget {
  category: Category
  limit: number
}

export interface ChartItem {
  category: string
  percentage: number
  amount: number
  hsl: string
}

export const CATEGORIES: { value: Category; label: string; icon: string; color: string; hsl: string }[] = [
  { value: 'food',          label: 'Food & Drinks',  icon: 'i-heroicons-cake',                       color: 'orange', hsl: '25 95% 53%'   },
  { value: 'transport',     label: 'Transport',       icon: 'i-heroicons-truck',                      color: 'blue',   hsl: '221 83% 53%'  },
  { value: 'housing',       label: 'Housing',         icon: 'i-heroicons-home',                       color: 'purple', hsl: '271 81% 56%'  },
  { value: 'entertainment', label: 'Entertainment',   icon: 'i-heroicons-film',                       color: 'pink',   hsl: '346 77% 50%'  },
  { value: 'health',        label: 'Health',          icon: 'i-heroicons-heart',                      color: 'red',    hsl: '0 72% 51%'    },
  { value: 'shopping',      label: 'Shopping',        icon: 'i-heroicons-shopping-bag',               color: 'yellow', hsl: '47 96% 53%'   },
  { value: 'other',         label: 'Other',           icon: 'i-heroicons-ellipsis-horizontal-circle', color: 'gray',   hsl: '220 9% 46%'   },
]
