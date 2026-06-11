<template>
  <UForm :schema="schema" :state="form" class="space-y-4" @submit="onSubmit">
    <UFormField label="Title" name="title" required>
      <UInput v-model="form.title" placeholder="e.g. Lunch at Mamak" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Amount (RM)" name="amount" required>
        <UInput
          v-model.number="form.amount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Date" name="date" required>
        <UInput v-model="form.date" type="date" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Category" name="category" required>
      <USelect v-model="form.category" :items="categoryOptions" class="w-full" />
    </UFormField>

    <UFormField label="Note" name="note">
      <UTextarea v-model="form.note" placeholder="Optional note..." :rows="3" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-2 pt-2">
      <UButton label="Cancel" variant="ghost" color="neutral" @click="$emit('cancel')" />
      <UButton type="submit" :label="submitLabel" :loading="loading" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { CATEGORIES, type ExpenseForm, type Expense } from '~/types/expense'
import { todayISO } from '~/utils/formatters'

const props = defineProps<{
  initial?: Expense
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [form: ExpenseForm]
  cancel: []
}>()

const submitLabel = computed(() => props.initial ? 'Update' : 'Add Expense')

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  note: z.string().optional(),
})

const form = reactive<ExpenseForm>({
  title: props.initial?.title ?? '',
  amount: props.initial?.amount ?? null,
  category: props.initial?.category ?? 'food',
  date: props.initial?.date ?? todayISO(),
  note: props.initial?.note ?? '',
})

const categoryOptions = CATEGORIES.map(c => ({ value: c.value, label: c.label }))

function onSubmit() {
  emit('submit', { ...form })
}
</script>
