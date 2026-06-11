<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ isManager ? `${selectedEmployee?.name}'s spending overview` : 'Your spending overview' }}
        </p>
      </div>
      <UButton v-if="!isManager" label="Add Expense" icon="i-heroicons-plus" to="/expenses/new" />
    </div>

    <!-- Total hero card -->
    <div class="relative overflow-hidden rounded-xl p-6 text-white" style="background: linear-gradient(135deg, var(--ui-color-primary-500) 0%, var(--ui-color-primary-700) 100%)">
      <div class="relative z-10">
        <p class="text-sm font-medium text-white/70">Total Spent</p>
        <p class="text-4xl font-bold tabular-nums mt-1">{{ formatCurrency(totalSpent) }}</p>
        <p class="text-xs text-white/50 mt-2">All time across all categories</p>
      </div>
      <UIcon name="i-heroicons-banknotes" class="absolute -right-2 -bottom-2 size-28 text-white/10" />
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <UCard
        v-for="cat in topCategories"
        :key="cat.value"
        :ui="{ body: 'p-4' }"
        class="hover:shadow-md transition-shadow duration-200"
      >
        <div
          class="size-9 rounded-lg flex items-center justify-center mb-3"
          :style="catIconStyle(cat.color)"
        >
          <UIcon :name="cat.icon" class="size-4" :style="catIconTextStyle(cat.color)" />
        </div>
        <p class="text-xl font-bold tabular-nums">
          {{ formatCurrency(spentByCategory[cat.value] ?? 0) }}
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{{ cat.label }}</p>
      </UCard>
    </div>

    <!-- Budget + Donut side by side -->
    <div v-if="budgetRows.length || chartData.length" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      <!-- Monthly Budgets -->
      <div v-if="budgetRows.length">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-1 h-4 rounded-full bg-primary-500" />
            <h2 class="font-semibold">Monthly Budgets</h2>
          </div>
          <UButton label="Edit" to="/budgets" variant="ghost" size="sm" color="neutral" />
        </div>
        <UCard :ui="{ body: 'p-0' }">
          <div class="divide-y divide-gray-100 dark:divide-gray-800 px-4">
            <div
              v-for="row in budgetRows"
              :key="row.category"
              class="py-3.5 space-y-2"
            >
              <div class="flex items-center justify-between gap-3 text-sm">
                <div class="flex items-center gap-2 min-w-0">
                  <UIcon :name="row.icon" class="size-4 shrink-0" :style="catIconTextStyle(row.color)" />
                  <span class="font-medium truncate">{{ row.label }}</span>
                  <UBadge
                    v-if="row.pct > 100"
                    label="Over budget"
                    color="error"
                    variant="subtle"
                    size="xs"
                    class="shrink-0"
                  />
                </div>
                <span class="tabular-nums text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 text-xs">
                  {{ formatCurrency(row.spent) }} / {{ formatCurrency(row.limit) }}
                </span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  class="h-full rounded-full"
                  :class="row.pct > 100 ? 'bg-red-500' : row.pct > 70 ? 'bg-amber-500' : 'bg-primary-500'"
                  :style="{ width: `${Math.min(row.pct, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Spending Breakdown donut -->
      <div v-if="chartData.length" class="flex justify-center lg:justify-start">
        <ExpensesWeeklyExpenseCard
          title="Spending Breakdown"
          :date-range="weekLabel"
          :data="chartData"
          class="w-full"
          @button-click="$router.push('/expenses')"
        />
      </div>
    </div>

    <!-- Recent expenses -->
    <div>
      <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="w-1 h-4 rounded-full bg-primary-500" />
        <h2 class="font-semibold">Recent Expenses</h2>
      </div>
      <UButton label="View all" to="/expenses" variant="ghost" size="sm" color="neutral" />
    </div>

      <UCard v-if="recentExpenses.length" :ui="{ body: 'p-0' }">
        <div class="divide-y divide-gray-100 dark:divide-gray-800 px-4">
          <ExpensesExpenseItem
            v-for="expense in recentExpenses"
            :key="expense.id"
            :expense="expense"
          />
        </div>
      </UCard>

      <UCard v-else :ui="{ body: 'py-14 text-center' }">
        <div class="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
          <UIcon name="i-heroicons-inbox" class="size-6 text-gray-400" />
        </div>
        <p class="font-medium text-gray-600 dark:text-gray-300">No expenses yet</p>
        <p class="text-gray-400 text-sm mt-1">Start tracking by adding your first expense</p>
        <UButton label="Add your first expense" variant="soft" class="mt-4" to="/expenses/new" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, type ChartItem } from '~/types/expense'
import { formatCurrency } from '~/utils/formatters'

const { user } = useUserSession()
const isManager = computed(() => (user.value as any)?.role === 'manager')
const { selected: selectedEmployee } = useSelectedEmployee()

const { expenses } = useExpenses()
const { getBudget } = useBudgets()

// Filter expenses to the selected employee when manager is viewing
const viewExpenses = computed(() =>
  isManager.value && selectedEmployee.value
    ? expenses.value.filter(e => e.userId === selectedEmployee.value!.id)
    : expenses.value,
)

const totalSpent = computed(() =>
  viewExpenses.value.reduce((s, e) => s + e.amount, 0),
)

const spentByCategory = computed(() => {
  const map: Record<string, number> = {}
  for (const e of viewExpenses.value) {
    map[e.category] = (map[e.category] ?? 0) + e.amount
  }
  return map
})

const recentExpenses = computed(() =>
  [...viewExpenses.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5),
)

const budgetRows = computed(() =>
  CATEGORIES
    .filter(cat => getBudget(cat.value))
    .map((cat) => {
      const limit = getBudget(cat.value)!.limit
      const spent = spentByCategory.value[cat.value] ?? 0
      return {
        category: cat.value,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        spent,
        limit,
        pct: Math.round((spent / limit) * 100),
      }
    }),
)

const topCategories = CATEGORIES.slice(0, 4)

// Static color map — Tailwind v4 can't detect dynamic class names like `bg-${color}-100`
const colorMap: Record<string, { bg: string; text: string }> = {
  orange: { bg: 'rgba(254,215,170,0.5)', text: '#f97316' },
  blue:   { bg: 'rgba(191,219,254,0.5)', text: '#3b82f6' },
  purple: { bg: 'rgba(233,213,255,0.5)', text: '#a855f7' },
  pink:   { bg: 'rgba(251,207,232,0.5)', text: '#ec4899' },
  red:    { bg: 'rgba(254,202,202,0.5)', text: '#ef4444' },
  yellow: { bg: 'rgba(254,240,138,0.5)', text: '#eab308' },
  gray:   { bg: 'rgba(229,231,235,0.5)', text: '#6b7280' },
}

function catIconStyle(color: string) {
  return { backgroundColor: colorMap[color]?.bg ?? 'rgba(229,231,235,0.5)' }
}
function catIconTextStyle(color: string) {
  return { color: colorMap[color]?.text ?? '#6b7280' }
}

const chartData = computed<ChartItem[]>(() => {
  const total = Object.values(spentByCategory.value).reduce((s, v) => s + v, 0)
  if (total === 0) return []

  return CATEGORIES
    .filter(cat => (spentByCategory.value[cat.value] ?? 0) > 0)
    .map(cat => ({
      category: cat.label,
      amount: spentByCategory.value[cat.value] ?? 0,
      percentage: Math.round(((spentByCategory.value[cat.value] ?? 0) / total) * 100),
      hsl: cat.hsl,
    }))
})

const weekLabel = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(now)}`
})
</script>
