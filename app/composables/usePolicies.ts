import type { Category, Expense } from '~/types/expense'

interface PolicyRow { category: string; maxAmount: number }

export function usePolicies() {
  const { selected } = useSelectedEmployee()
  const { user } = useUserSession()
  const isManager = computed(() => (user.value as any)?.role === 'manager')
  const targetUserId = computed(() => isManager.value ? selected.value?.id : undefined)

  const { data, refresh } = useAsyncData<PolicyRow[]>(
    'policies',
    () => $fetch<PolicyRow[]>('/api/policies', {
      query: targetUserId.value ? { userId: targetUserId.value } : undefined,
    }),
    { default: (): PolicyRow[] => [], watch: [targetUserId] },
  )

  const policies = computed(() => data.value ?? [])

  function getPolicy(category: Category): number | null {
    return policies.value.find(p => p.category === category)?.maxAmount ?? null
  }

  function isOverPolicy(expense: Pick<Expense, 'amount' | 'category'>): boolean {
    const max = getPolicy(expense.category)
    return max !== null && expense.amount > max
  }

  async function setPolicy(category: Category, max: number): Promise<void> {
    await $fetch(`/api/policies/${category}`, {
      method: 'PUT',
      body: { max, userId: targetUserId.value },
    })
    await refresh()
  }

  async function removePolicy(category: Category): Promise<void> {
    await $fetch(`/api/policies/${category}`, {
      method: 'DELETE',
      query: targetUserId.value ? { userId: targetUserId.value } : undefined,
    })
    await refresh()
  }

  return { policies: readonly(policies), getPolicy, isOverPolicy, setPolicy, removePolicy }
}
