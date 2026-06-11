<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Expenses</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ filtered.length }} expense{{ filtered.length === 1 ? '' : 's' }}</p>
      </div>
      <UButton label="Add Expense" icon="i-heroicons-plus" to="/expenses/new" />
    </div>

    <!-- Filter bar -->
    <div class="flex gap-2 flex-wrap">
      <UButton
        label="All"
        :variant="selectedCategory === null ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        @click="selectedCategory = null"
      />
      <UButton
        v-for="cat in CATEGORIES"
        :key="cat.value"
        :label="cat.label"
        :icon="cat.icon"
        :variant="selectedCategory === cat.value ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        @click="selectedCategory = cat.value"
      />
    </div>

    <!-- List -->
    <UCard v-if="filtered.length" :ui="{ body: 'p-0' }">
      <div class="divide-y divide-gray-100 dark:divide-gray-800 px-4">
        <ExpensesExpenseItem
          v-for="expense in filtered"
          :key="expense.id"
          :expense="expense"
          :show-actions="true"
          @delete="confirmDelete"
          @claim="openClaimModal"
        />
      </div>
    </UCard>

    <UCard v-else :ui="{ body: 'py-12 text-center' }">
      <UIcon name="i-heroicons-funnel" class="size-10 text-gray-300 mx-auto mb-2" />
      <p class="text-gray-500 dark:text-gray-400 text-sm">No expenses found</p>
    </UCard>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <p class="font-semibold">Delete Expense</p>
          </template>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this expense? This cannot be undone.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" color="neutral" @click="showDeleteModal = false" />
              <UButton label="Delete" color="error" @click="doDelete" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Claim submission modal -->
    <UModal v-model:open="showClaimModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-up-on-square" class="size-5 text-amber-500" />
              <p class="font-semibold">Submit Expense Claim</p>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Policy warning -->
            <div
              v-if="pendingClaimExpense && isOverPolicy(pendingClaimExpense)"
              class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5"
            >
              <UIcon name="i-heroicons-exclamation-triangle" class="size-4 text-red-500 mt-0.5 shrink-0" />
              <p class="text-sm text-red-700 dark:text-red-300">
                This expense ({{ formatCurrency(pendingClaimExpense.amount) }}) exceeds the
                <strong>{{ catLabel(pendingClaimExpense.category) }}</strong> claim policy of
                {{ formatCurrency(getPolicy(pendingClaimExpense.category)!) }}.
                You can still submit, but it may be flagged for review.
              </p>
            </div>

            <!-- Submitted by -->
            <div>
              <label class="block text-sm font-medium mb-1.5">Submitted by</label>
              <UInput v-model="claimForm.submittedBy" placeholder="Your name" class="w-full" />
            </div>

            <!-- Justification -->
            <div>
              <label class="block text-sm font-medium mb-1.5">
                Business justification <span class="text-red-500">*</span>
              </label>
              <UTextarea
                v-model="claimForm.note"
                placeholder="Explain the business purpose of this expense…"
                :rows="3"
                class="w-full"
              />
              <p class="text-xs text-gray-400 mt-1">Required — shown to the approver</p>
            </div>

            <!-- Receipt -->
            <div>
              <label class="block text-sm font-medium mb-1.5">
                Receipt
                <span class="text-gray-400 font-normal">(optional · images only)</span>
              </label>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 cursor-pointer"
                @change="handleFileChange"
              />
              <div v-if="claimForm.receiptPreview" class="mt-2 relative w-fit">
                <img
                  :src="claimForm.receiptPreview"
                  class="h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
                <button
                  class="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-gray-600"
                  @click="clearReceipt"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" color="neutral" @click="showClaimModal = false" />
              <UButton
                label="Submit Claim"
                icon="i-heroicons-arrow-up-on-square"
                color="warning"
                :disabled="!claimForm.note.trim()"
                @click="doSubmitClaim"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, type Category } from '~/types/expense'
import { formatCurrency } from '~/utils/formatters'

const { expenses, deleteExpense, updateStatus } = useExpenses()
const { isOverPolicy, getPolicy } = usePolicies()
const { settings, setDisplayName } = useSettings()
const toast = useToast()

const { user } = useUserSession()
const isManager = computed(() => (user.value as any)?.role === 'manager')
const { selected: selectedEmployee } = useSelectedEmployee()

// ── Claim modal ────────────────────────────────────────────────────────────
const showClaimModal = ref(false)
const pendingClaimId = ref<string | null>(null)
const claimForm = reactive({ note: '', receipt: '', receiptPreview: '', submittedBy: '' })
const fileInput = ref<HTMLInputElement | null>(null)

const pendingClaimExpense = computed(() =>
  expenses.value.find(e => e.id === pendingClaimId.value) ?? null,
)

function catLabel(category: string) {
  return CATEGORIES.find(c => c.value === category)?.label ?? category
}

function openClaimModal(id: string) {
  pendingClaimId.value = id
  claimForm.note = ''
  claimForm.receipt = ''
  claimForm.receiptPreview = ''
  claimForm.submittedBy = settings.value.displayName
  showClaimModal.value = true
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    claimForm.receipt = reader.result as string
    claimForm.receiptPreview = reader.result as string
  }
  reader.readAsDataURL(file)
}

function clearReceipt() {
  claimForm.receipt = ''
  claimForm.receiptPreview = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function doSubmitClaim() {
  if (!pendingClaimId.value || !claimForm.note.trim()) return
  if (claimForm.submittedBy.trim()) setDisplayName(claimForm.submittedBy.trim())
  await updateStatus(pendingClaimId.value, 'pending', {
    claimNote: claimForm.note.trim(),
    receipt: claimForm.receipt || undefined,
    submittedBy: claimForm.submittedBy.trim() || undefined,
  })
  toast.add({ title: 'Claim submitted', color: 'warning', icon: 'i-heroicons-clock' })
  showClaimModal.value = false
  pendingClaimId.value = null
}

// ── Filters ────────────────────────────────────────────────────────────────
const selectedCategory = ref<Category | null>(null)

const filtered = computed(() => {
  let list = [...expenses.value].sort((a, b) => b.date.localeCompare(a.date))
  if (isManager.value && selectedEmployee.value) {
    list = list.filter(e => e.userId === selectedEmployee.value!.id)
  }
  if (selectedCategory.value) {
    list = list.filter(e => e.category === selectedCategory.value)
  }
  return list
})

// ── Delete ─────────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const pendingDeleteId = ref<string | null>(null)

function confirmDelete(id: string) {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

async function doDelete() {
  if (pendingDeleteId.value) {
    await deleteExpense(pendingDeleteId.value)
  }
  showDeleteModal.value = false
  pendingDeleteId.value = null
}
</script>
