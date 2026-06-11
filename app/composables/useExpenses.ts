import type { Expense, ExpenseForm, Category, ClaimStatus } from '~/types/expense'

export function useExpenses() {
  // useAsyncData with a fixed key — shared singleton across all components
  const { data, refresh } = useAsyncData<Expense[]>(
    'expenses',
    () => $fetch<Expense[]>('/api/expenses'),
    { default: (): Expense[] => [] },
  )

  const expenses = computed(() => data.value ?? [])

  async function addExpense(form: ExpenseForm): Promise<Expense> {
    const result = await $fetch<Expense>('/api/expenses', {
      method: 'POST',
      body: {
        title:    form.title,
        amount:   form.amount,
        category: form.category,
        date:     form.date,
        note:     form.note,
      },
    })
    await refresh()
    return result
  }

  async function updateExpense(id: string, form: ExpenseForm): Promise<void> {
    await $fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      body: {
        title:    form.title,
        amount:   form.amount,
        category: form.category,
        date:     form.date,
        note:     form.note,
      },
    })
    await refresh()
  }

  async function deleteExpense(id: string): Promise<void> {
    await $fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    await refresh()
  }

  function getExpenseById(id: string): Expense | undefined {
    return expenses.value.find(e => e.id === id)
  }

  async function updateStatus(
    id: string,
    status: ClaimStatus,
    extras?: { claimNote?: string; receipt?: string; submittedBy?: string; comment?: string },
  ): Promise<void> {
    await $fetch(`/api/expenses/${id}/status`, {
      method: 'PATCH',
      body: { status, ...extras },
    })
    await refresh()
  }

  // ── Derived stats ────────────────────────────────────────────────────────

  const totalSpent = computed(() =>
    expenses.value.reduce((sum, e) => sum + e.amount, 0),
  )

  const spentByCategory = computed(() => {
    const map: Record<Category, number> = {} as Record<Category, number>
    for (const e of expenses.value) {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    }
    return map
  })

  const recentExpenses = computed(() =>
    [...expenses.value]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
  )

  const claimStats = computed(() => {
    const byStatus = (s: ClaimStatus) => expenses.value.filter(e => (e.status ?? 'personal') === s)
    const total = (list: Expense[]) => list.reduce((sum, e) => sum + e.amount, 0)
    const pending    = byStatus('pending')
    const approved   = byStatus('approved')
    const reimbursed = byStatus('reimbursed')
    const rejected   = byStatus('rejected')
    return {
      pending:    { count: pending.length,    amount: total(pending) },
      approved:   { count: approved.length,   amount: total(approved) },
      reimbursed: { count: reimbursed.length, amount: total(reimbursed) },
      rejected:   { count: rejected.length,   amount: total(rejected) },
    }
  })

  return {
    expenses: readonly(expenses),
    totalSpent,
    spentByCategory,
    recentExpenses,
    claimStats,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    updateStatus,
  }
}
