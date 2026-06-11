import type { Budget, Category } from '~/types/expense'

export function useBudgets() {
  const { selected } = useSelectedEmployee()
  const { user } = useUserSession()
  const isManager = computed(() => (user.value as any)?.role === 'manager')
  const targetUserId = computed(() => isManager.value ? selected.value?.id : undefined)

  const { data, refresh } = useAsyncData<Budget[]>(
    'budgets',
    () => $fetch<Budget[]>('/api/budgets', {
      query: targetUserId.value ? { userId: targetUserId.value } : undefined,
    }),
    { default: (): Budget[] => [], watch: [targetUserId] },
  )

  const budgets = computed(() => data.value ?? [])

  function getBudget(category: Category): Budget | undefined {
    return budgets.value.find(b => b.category === category)
  }

  async function setBudget(category: Category, limit: number): Promise<void> {
    await $fetch(`/api/budgets/${category}`, {
      method: 'PUT',
      body: { limit, userId: targetUserId.value },
    })
    await refresh()
  }

  async function removeBudget(category: Category): Promise<void> {
    await $fetch(`/api/budgets/${category}`, {
      method: 'DELETE',
      query: targetUserId.value ? { userId: targetUserId.value } : undefined,
    })
    await refresh()
  }

  return { budgets: readonly(budgets), getBudget, setBudget, removeBudget }
}
