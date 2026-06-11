<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Expense Claims</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage your reimbursement requests</p>
      </div>
      <UButton
        label="Export CSV"
        icon="i-heroicons-arrow-down-tray"
        variant="outline"
        color="neutral"
        size="sm"
        @click="exportCSV"
      />
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <UCard :ui="{ body: 'p-4' }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <UIcon name="i-heroicons-clock" class="size-4 text-amber-500" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            <p class="text-base font-bold tabular-nums truncate">{{ formatCurrency(claimStats.pending.amount) }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ claimStats.pending.count }} expense{{ claimStats.pending.count === 1 ? '' : 's' }}</p>
      </UCard>

      <UCard :ui="{ body: 'p-4' }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 shrink-0">
            <UIcon name="i-heroicons-check-badge" class="size-4 text-blue-500" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Approved</p>
            <p class="text-base font-bold tabular-nums truncate">{{ formatCurrency(claimStats.approved.amount) }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ claimStats.approved.count }} expense{{ claimStats.approved.count === 1 ? '' : 's' }}</p>
      </UCard>

      <UCard :ui="{ body: 'p-4' }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
            <UIcon name="i-heroicons-banknotes" class="size-4 text-green-500" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Reimbursed</p>
            <p class="text-base font-bold tabular-nums truncate">{{ formatCurrency(claimStats.reimbursed.amount) }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ claimStats.reimbursed.count }} expense{{ claimStats.reimbursed.count === 1 ? '' : 's' }}</p>
      </UCard>

      <UCard :ui="{ body: 'p-4' }">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30 shrink-0">
            <UIcon name="i-heroicons-x-circle" class="size-4 text-red-500" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
            <p class="text-base font-bold tabular-nums truncate">{{ formatCurrency(claimStats.rejected.amount) }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ claimStats.rejected.count }} expense{{ claimStats.rejected.count === 1 ? '' : 's' }}</p>
      </UCard>
    </div>

    <!-- Tabs -->
    <UTabs :items="tabs" class="w-full">
      <template #content="{ item }">
        <div class="mt-4">

          <!-- Team view -->
          <template v-if="item.key === 'team'">
            <div v-if="teamGroups.length" class="space-y-4">
              <div v-for="group in teamGroups" :key="group.name">
                <div class="flex items-center gap-2 mb-2 px-1">
                  <div
                    class="size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style="background: var(--ui-color-primary-100); color: var(--ui-color-primary-600)"
                  >
                    {{ group.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-sm">{{ group.name }}</span>
                  <span class="text-xs text-gray-400">{{ group.expenses.length }} claim{{ group.expenses.length !== 1 ? 's' : '' }}</span>
                  <span class="ml-auto text-sm font-semibold tabular-nums">{{ formatCurrency(group.total) }}</span>
                </div>
                <UCard :ui="{ body: 'p-0' }">
                  <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    <ClaimsClaimRow
                      v-for="expense in group.expenses"
                      :key="expense.id"
                      :expense="expense"
                      :show-status-badge="true"
                      @advance="openAction"
                      @reject="openReject"
                      @resubmit="doResubmit"
                      @revert="revert"
                      @view-receipt="viewReceipt"
                    />
                  </div>
                </UCard>
              </div>
            </div>

            <UCard v-else :ui="{ body: 'py-10 text-center' }">
              <UIcon name="i-heroicons-user-group" class="size-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-400">No claims submitted yet</p>
              <p class="text-xs text-gray-300 mt-1">Enter your name when submitting a claim — it will appear here</p>
            </UCard>
          </template>

          <!-- Status tabs -->
          <template v-else>
            <UCard v-if="grouped[item.key as ClaimStatus]?.length" :ui="{ body: 'p-0' }">
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <ClaimsClaimRow
                  v-for="expense in grouped[item.key as ClaimStatus]"
                  :key="expense.id"
                  :expense="expense"
                  :show-status-badge="false"
                  @advance="openAction"
                  @reject="openReject"
                  @resubmit="doResubmit"
                  @revert="revert"
                  @view-receipt="viewReceipt"
                />
              </div>
            </UCard>

            <UCard v-else :ui="{ body: 'py-10 text-center' }">
              <UIcon name="i-heroicons-inbox" class="size-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-400">No {{ item.label.toLowerCase() }} claims</p>
            </UCard>
          </template>

        </div>
      </template>
    </UTabs>

    <!-- Advance with optional comment modal -->
    <UModal v-model:open="actionModal">
      <template #content>
        <UCard>
          <template #header>
            <p class="font-semibold">{{ pendingAction?.label }}</p>
          </template>
          <div>
            <label class="block text-sm font-medium mb-1.5">
              Comment <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <UTextarea
              v-model="actionComment"
              placeholder="Add a note for the claimant…"
              :rows="3"
              class="w-full"
            />
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" color="neutral" @click="actionModal = false" />
              <UButton :label="pendingAction?.label ?? 'Confirm'" @click="confirmAction" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Reject modal (comment required) -->
    <UModal v-model:open="rejectModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-x-circle" class="size-5 text-red-500" />
              <p class="font-semibold">Reject Claim</p>
            </div>
          </template>
          <div>
            <label class="block text-sm font-medium mb-1.5">
              Reason <span class="text-red-500">*</span>
            </label>
            <UTextarea
              v-model="rejectComment"
              placeholder="Explain why this claim is being rejected…"
              :rows="3"
              class="w-full"
            />
            <p class="text-xs text-gray-400 mt-1">This will be visible in the claim history</p>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" color="neutral" @click="rejectModal = false" />
              <UButton
                label="Reject Claim"
                color="error"
                :disabled="!rejectComment.trim()"
                @click="confirmReject"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Receipt viewer -->
    <UModal v-model:open="showReceiptModal">
      <template #content>
        <UCard>
          <template #header>
            <p class="font-semibold">Receipt — {{ receiptExpense?.title }}</p>
          </template>
          <div class="flex justify-center">
            <img
              v-if="receiptExpense?.receipt"
              :src="receiptExpense.receipt"
              class="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, CLAIM_STATUSES, type ClaimStatus, type Expense } from '~/types/expense'
import { formatCurrency } from '~/utils/formatters'

const { expenses, claimStats, updateStatus } = useExpenses()
const toast = useToast()

const tabs = [
  { key: 'pending',    label: 'Pending',    icon: 'i-heroicons-clock' },
  { key: 'approved',   label: 'Approved',   icon: 'i-heroicons-check-badge' },
  { key: 'reimbursed', label: 'Reimbursed', icon: 'i-heroicons-banknotes' },
  { key: 'rejected',   label: 'Rejected',   icon: 'i-heroicons-x-circle' },
  { key: 'team',       label: 'Team',       icon: 'i-heroicons-user-group' },
]

// ── Grouped data ───────────────────────────────────────────────────────────
const grouped = computed(() => {
  const map: Partial<Record<ClaimStatus, Expense[]>> = {}
  for (const e of expenses.value) {
    const s = e.status ?? 'personal'
    if (s === 'personal') continue
    ;(map[s] ??= []).push(e as Expense)
  }
  return map
})

const teamGroups = computed(() => {
  const all = expenses.value.filter(e => e.status && e.status !== 'personal')
  const map = new Map<string, Expense[]>()
  for (const e of all) {
    const name = e.submittedBy?.trim() || 'Unnamed'
    if (!map.has(name)) map.set(name, [])
    map.get(name)!.push(e as Expense)
  }
  return Array.from(map.entries()).map(([name, exps]) => ({
    name,
    expenses: exps,
    total: exps.reduce((s, e) => s + e.amount, 0),
  }))
})

// ── Advance modal ──────────────────────────────────────────────────────────
const actionModal = ref(false)
const pendingAction = ref<{ id: string; status: ClaimStatus; label: string } | null>(null)
const actionComment = ref('')

function openAction(id: string, status: ClaimStatus, label: string) {
  pendingAction.value = { id, status, label }
  actionComment.value = ''
  actionModal.value = true
}

async function confirmAction() {
  if (!pendingAction.value) return
  const { id, status } = pendingAction.value
  const meta = CLAIM_STATUSES.find(s => s.value === status)
  await updateStatus(id, status, { comment: actionComment.value.trim() || undefined })
  toast.add({
    title: `Marked as ${meta?.label ?? status}`,
    color: meta?.color ?? 'neutral',
    icon: 'i-heroicons-check-circle',
  })
  actionModal.value = false
}

// ── Reject modal ───────────────────────────────────────────────────────────
const rejectModal = ref(false)
const pendingRejectId = ref<string | null>(null)
const rejectComment = ref('')

function openReject(id: string) {
  pendingRejectId.value = id
  rejectComment.value = ''
  rejectModal.value = true
}

async function confirmReject() {
  if (!pendingRejectId.value || !rejectComment.value.trim()) return
  await updateStatus(pendingRejectId.value, 'rejected', { comment: rejectComment.value.trim() })
  toast.add({ title: 'Claim rejected', color: 'error', icon: 'i-heroicons-x-circle' })
  rejectModal.value = false
  pendingRejectId.value = null
}

// ── Other actions ──────────────────────────────────────────────────────────
async function doResubmit(id: string) {
  await updateStatus(id, 'pending')
  toast.add({ title: 'Claim resubmitted', color: 'warning', icon: 'i-heroicons-clock' })
}

async function revert(id: string) {
  await updateStatus(id, 'personal')
  toast.add({ title: 'Claim withdrawn', color: 'neutral', icon: 'i-heroicons-arrow-uturn-left' })
}

// ── Receipt viewer ─────────────────────────────────────────────────────────
const showReceiptModal = ref(false)
const receiptExpense = ref<Expense | null>(null)

function viewReceipt(expense: Expense) {
  receiptExpense.value = expense
  showReceiptModal.value = true
}

// ── CSV export ─────────────────────────────────────────────────────────────
function exportCSV() {
  const catOf = (e: Expense) => CATEGORIES.find(c => c.value === e.category) ?? CATEGORIES[CATEGORIES.length - 1]!
  const headers = ['Title', 'Category', 'Amount', 'Date', 'Status', 'Submitted By', 'Justification', 'Submitted', 'Approved', 'Reimbursed', 'Rejected']
  const rows: string[][] = [headers]

  for (const e of expenses.value) {
    if (!e.status || e.status === 'personal') continue
    const history = e.claimHistory ?? []
    const getTs = (s: ClaimStatus) => {
      const entry = history.find(h => h.status === s)
      return entry ? new Date(entry.timestamp).toLocaleDateString() : ''
    }
    rows.push([
      e.title,
      catOf(e).label,
      e.amount.toFixed(2),
      e.date,
      e.status,
      e.submittedBy ?? '',
      e.claimNote ?? '',
      getTs('pending'),
      getTs('approved'),
      getTs('reimbursed'),
      getTs('rejected'),
    ])
  }

  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-claims-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
