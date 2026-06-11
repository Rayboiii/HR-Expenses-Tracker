<template>
  <div class="max-w-lg mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Edit Expense</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Update the details below</p>
    </div>

    <UCard v-if="expense">
      <ExpensesExpenseForm
        :initial="expense"
        @submit="onSubmit"
        @cancel="$router.back()"
      />
    </UCard>

    <UCard v-else :ui="{ body: 'py-12 text-center' }">
      <p class="text-gray-500 dark:text-gray-400">Expense not found.</p>
      <UButton label="Go back" to="/expenses" variant="soft" class="mt-3" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ExpenseForm } from '~/types/expense'

const route = useRoute()
const router = useRouter()
const { getExpenseById, updateExpense } = useExpenses()
const toast = useToast()

const expense = computed(() => getExpenseById(route.params.id as string))

async function onSubmit(form: ExpenseForm) {
  await updateExpense(route.params.id as string, form)
  toast.add({ title: 'Expense updated', color: 'success', icon: 'i-heroicons-check-circle' })
  router.push('/expenses')
}
</script>
