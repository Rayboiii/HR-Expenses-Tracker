<template>
  <div class="flex items-start gap-3 px-4 py-3">
    <!-- Category icon -->
    <div
      class="size-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      :style="{ backgroundColor: colorBg[cat.color] ?? colorBg.gray }"
    >
      <UIcon :name="cat.icon" class="size-5" :style="{ color: colorText[cat.color] ?? colorText.gray }" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <p class="font-medium text-sm truncate">{{ expense.title }}</p>
        <UBadge
          v-if="showStatusBadge"
          :label="meta.label"
          :color="meta.color"
          variant="subtle"
          size="xs"
          class="shrink-0"
        />
        <UBadge
          v-if="isOverPolicy(expense)"
          label="Over policy"
          color="error"
          variant="subtle"
          size="xs"
          class="shrink-0"
        />
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ cat.label }} · {{ formatDate(expense.date) }}
        <span v-if="expense.submittedBy"> · {{ expense.submittedBy }}</span>
      </p>
      <p
        v-if="expense.claimNote"
        class="text-xs text-gray-600 dark:text-gray-300 mt-1 italic line-clamp-2"
      >
        "{{ expense.claimNote }}"
      </p>
      <p v-if="historyLine" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {{ historyLine }}
      </p>
    </div>

    <!-- Amount + receipt -->
    <div class="flex items-center gap-1.5 shrink-0 mt-0.5">
      <UButton
        v-if="expense.receipt"
        icon="i-heroicons-paper-clip"
        size="xs"
        variant="ghost"
        color="neutral"
        title="View receipt"
        @click="$emit('view-receipt', expense)"
      />
      <span class="font-semibold text-sm tabular-nums">{{ formatCurrency(expense.amount) }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0 mt-0.5">
      <!-- Manager only: Approve / Mark Reimbursed -->
      <UButton
        v-if="isManager && status !== 'rejected' && meta.next && meta.next !== 'pending'"
        :label="meta.nextLabel"
        size="xs"
        variant="soft"
        :color="nextColor(meta.next)"
        @click="$emit('advance', expense.id, meta.next, meta.nextLabel)"
      />
      <!-- Manager only: Reject -->
      <UButton
        v-if="isManager && (status === 'pending' || status === 'approved')"
        label="Reject"
        size="xs"
        variant="ghost"
        color="error"
        @click="$emit('reject', expense.id)"
      />
      <!-- Employee + manager: Resubmit (rejected→pending) -->
      <UButton
        v-if="status === 'rejected'"
        label="Resubmit"
        size="xs"
        variant="soft"
        color="warning"
        @click="$emit('resubmit', expense.id)"
      />
      <!-- Employee + manager: Withdraw -->
      <UButton
        icon="i-heroicons-arrow-uturn-left"
        size="xs"
        variant="ghost"
        color="neutral"
        title="Withdraw claim"
        @click="$emit('revert', expense.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, CLAIM_STATUSES, type ClaimStatus, type Expense } from '~/types/expense'
import { formatCurrency, formatDate } from '~/utils/formatters'

const props = defineProps<{
  expense: Expense
  showStatusBadge?: boolean
}>()

defineEmits<{
  advance: [id: string, status: ClaimStatus, label: string]
  reject: [id: string]
  resubmit: [id: string]
  revert: [id: string]
  'view-receipt': [expense: Expense]
}>()

const { isOverPolicy } = usePolicies()
const { user } = useUserSession()
const isManager = computed(() => (user.value as any)?.role === 'manager')

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

const cat = computed(
  () => CATEGORIES.find(c => c.value === props.expense.category) ?? CATEGORIES[CATEGORIES.length - 1]!,
)

const status = computed(() => props.expense.status ?? 'personal')

const meta = computed(
  () => CLAIM_STATUSES.find(s => s.value === status.value)!,
)

const historyLine = computed(() =>
  (props.expense.claimHistory ?? [])
    .map(h => {
      const label = CLAIM_STATUSES.find(s => s.value === h.status)?.label ?? h.status
      const date = new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return h.comment ? `${label} ${date} (${h.comment})` : `${label} ${date}`
    })
    .join(' → '),
)

function nextColor(next?: ClaimStatus) {
  if (next === 'approved') return 'info'
  if (next === 'reimbursed') return 'success'
  if (next === 'pending') return 'warning'
  return 'neutral'
}
</script>
