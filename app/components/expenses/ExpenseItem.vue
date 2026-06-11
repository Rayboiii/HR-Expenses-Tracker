<template>
  <div class="flex items-center gap-3 py-3">
    <!-- Category icon -->
    <div
      class="size-10 rounded-full flex items-center justify-center flex-shrink-0"
      :style="{ backgroundColor: colorBg[category.color] ?? colorBg.gray }"
    >
      <UIcon :name="category.icon" class="size-5" :style="{ color: colorText[category.color] ?? colorText.gray }" />
    </div>

    <!-- Title + meta -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p class="font-medium text-sm truncate">{{ expense.title }}</p>
        <UBadge
          v-if="claimStatus && claimStatus.value !== 'personal'"
          :label="claimStatus.label"
          :color="claimStatus.color"
          variant="subtle"
          size="xs"
          class="shrink-0"
        />
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ category.label }} · {{ formatDate(expense.date) }}
      </p>
    </div>

    <!-- Amount -->
    <span class="font-semibold text-sm tabular-nums">
      {{ formatCurrency(expense.amount) }}
    </span>

    <!-- Actions -->
    <div v-if="showActions" class="flex items-center gap-1">
      <!-- Claim shortcut — only on personal expenses -->
      <UButton
        v-if="!expense.status || expense.status === 'personal'"
        label="Claim"
        icon="i-heroicons-arrow-up-on-square"
        variant="ghost"
        color="warning"
        size="xs"
        @click="$emit('claim', expense.id)"
      />
      <UButton
        icon="i-heroicons-pencil-square"
        variant="ghost"
        color="neutral"
        size="xs"
        :to="`/expenses/${expense.id}/edit`"
      />
      <UButton
        icon="i-heroicons-trash"
        variant="ghost"
        color="error"
        size="xs"
        @click="$emit('delete', expense.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, CLAIM_STATUSES, type Expense } from '~/types/expense'
import { formatCurrency, formatDate } from '~/utils/formatters'

const colorBg: Record<string, string> = {
  orange: 'rgba(254,215,170,0.5)', blue: 'rgba(191,219,254,0.5)', purple: 'rgba(233,213,255,0.5)',
  pink: 'rgba(251,207,232,0.5)',   red: 'rgba(254,202,202,0.5)',  yellow: 'rgba(254,240,138,0.5)',
  gray: 'rgba(229,231,235,0.5)',
}
const colorText: Record<string, string> = {
  orange: '#f97316', blue: '#3b82f6', purple: '#a855f7',
  pink: '#ec4899',   red: '#ef4444', yellow: '#eab308',
  gray: '#6b7280',
}

const props = defineProps<{
  expense: Expense
  showActions?: boolean
}>()

defineEmits<{
  delete: [id: string]
  claim: [id: string]
}>()

const category = computed(
  () => CATEGORIES.find(c => c.value === props.expense.category) ?? CATEGORIES[CATEGORIES.length - 1]!,
)

const claimStatus = computed(
  () => CLAIM_STATUSES.find(s => s.value === (props.expense.status ?? 'personal')),
)
</script>
