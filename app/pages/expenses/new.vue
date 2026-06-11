<template>
  <div class="max-w-lg mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Add Expense</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Record a new expense</p>
    </div>

    <UCard>
      <ExpensesExpenseForm @submit="onSubmit" @cancel="$router.back()" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ExpenseForm } from '~/types/expense'

const router = useRouter()
const { addExpense } = useExpenses()
const toast = useToast()

async function onSubmit(form: ExpenseForm) {
  await addExpense(form)
  toast.add({ title: 'Expense added', color: 'success', icon: 'i-heroicons-check-circle' })
  router.push('/expenses')
}
</script>
