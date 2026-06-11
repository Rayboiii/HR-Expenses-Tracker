<template>
  <div class="space-y-8 max-w-lg mx-auto">
    <!-- Monthly Budgets -->
    <div>
      <div class="mb-4">
        <h1 class="text-2xl font-bold">Monthly Budgets</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Set a spending limit per category. Resets every month.
        </p>
      </div>

      <UCard>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="cat in CATEGORIES"
            :key="cat.value"
            class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-2 w-36 shrink-0">
              <UIcon :name="cat.icon" class="size-4 shrink-0" :class="`text-${cat.color}-500`" />
              <span class="text-sm font-medium truncate">{{ cat.label }}</span>
            </div>

            <UInput
              :model-value="budgetDrafts[cat.value]"
              type="number"
              placeholder="No limit"
              min="0"
              step="10"
              class="flex-1"
              :disabled="!isManager"
              @update:model-value="isManager && (budgetDrafts[cat.value] = $event as string)"
            >
              <template #leading>
                <span class="text-gray-400 text-sm">RM</span>
              </template>
            </UInput>

            <template v-if="isManager">
              <UButton
                v-if="getBudget(cat.value)"
                icon="i-heroicons-x-mark"
                variant="ghost"
                color="error"
                size="xs"
                @click="onRemoveBudget(cat.value)"
              />
              <div v-else class="size-7 shrink-0" />
            </template>
            <div v-else class="size-7 shrink-0" />
          </div>
        </div>

        <template v-if="isManager" #footer>
          <div class="flex justify-end">
            <UButton label="Save Budgets" icon="i-heroicons-check" :loading="savingBudgets" @click="onSaveBudgets" />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Claim Policies -->
    <div>
      <div class="mb-4">
        <h2 class="text-xl font-bold">Claim Policies</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Maximum amount allowed per claim by category. Exceeding this triggers a warning on submission.
        </p>
      </div>

      <UCard>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="cat in CATEGORIES"
            :key="cat.value"
            class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-2 w-36 shrink-0">
              <UIcon :name="cat.icon" class="size-4 shrink-0" :class="`text-${cat.color}-500`" />
              <span class="text-sm font-medium truncate">{{ cat.label }}</span>
            </div>

            <UInput
              :model-value="policyDrafts[cat.value]"
              type="number"
              placeholder="No limit"
              min="0"
              step="10"
              class="flex-1"
              :disabled="!isManager"
              @update:model-value="isManager && (policyDrafts[cat.value] = $event as string)"
            >
              <template #leading>
                <span class="text-gray-400 text-sm">RM</span>
              </template>
            </UInput>

            <template v-if="isManager">
              <UButton
                v-if="getPolicy(cat.value)"
                icon="i-heroicons-x-mark"
                variant="ghost"
                color="error"
                size="xs"
                @click="onRemovePolicy(cat.value)"
              />
              <div v-else class="size-7 shrink-0" />
            </template>
            <div v-else class="size-7 shrink-0" />
          </div>
        </div>

        <template v-if="isManager" #footer>
          <div class="flex justify-end">
            <UButton label="Save Policies" icon="i-heroicons-shield-check" :loading="savingPolicies" @click="onSavePolicies" />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, type Category } from '~/types/expense'

const { user } = useUserSession()
const isManager = computed(() => (user.value as any)?.role === 'manager')
const { selected: selectedEmployee } = useSelectedEmployee()

const { budgets, getBudget, setBudget, removeBudget } = useBudgets()
const { policies, getPolicy, setPolicy, removePolicy } = usePolicies()
const toast = useToast()

// ── Budget drafts — filled reactively once data loads ──────────────────────
const budgetDrafts = reactive<Record<string, string>>({})

// Reset drafts when switching employees so they repopulate from fresh data
watch(selectedEmployee, () => {
  CATEGORIES.forEach(cat => { delete budgetDrafts[cat.value] })
})

watch(budgets, (rows) => {
  for (const cat of CATEGORIES) {
    const found = rows.find(b => b.category === cat.value)
    if (budgetDrafts[cat.value] === undefined) {
      budgetDrafts[cat.value] = found?.limit.toString() ?? ''
    }
  }
}, { immediate: true })

const savingBudgets = ref(false)

async function onSaveBudgets() {
  savingBudgets.value = true
  try {
    for (const cat of CATEGORIES) {
      const val = parseFloat(budgetDrafts[cat.value] ?? '')
      if (!isNaN(val) && val > 0) {
        await setBudget(cat.value as Category, val)
      } else if (budgetDrafts[cat.value] === '' && getBudget(cat.value)) {
        await removeBudget(cat.value as Category)
      }
    }
    toast.add({ title: 'Budgets saved', color: 'success', icon: 'i-heroicons-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Failed to save', description: e?.data?.message ?? e?.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    savingBudgets.value = false
  }
}

async function onRemoveBudget(category: Category) {
  budgetDrafts[category] = ''
  await removeBudget(category)
}

// ── Policy drafts — same pattern ───────────────────────────────────────────
const policyDrafts = reactive<Record<string, string>>({})

watch(selectedEmployee, () => {
  CATEGORIES.forEach(cat => { delete policyDrafts[cat.value] })
})

watch(policies, (rows) => {
  for (const cat of CATEGORIES) {
    const found = rows.find(p => p.category === cat.value)
    if (policyDrafts[cat.value] === undefined) {
      policyDrafts[cat.value] = found?.maxAmount.toString() ?? ''
    }
  }
}, { immediate: true })

const savingPolicies = ref(false)

async function onSavePolicies() {
  savingPolicies.value = true
  try {
    for (const cat of CATEGORIES) {
      const val = parseFloat(policyDrafts[cat.value] ?? '')
      if (!isNaN(val) && val > 0) {
        await setPolicy(cat.value as Category, val)
      } else if (policyDrafts[cat.value] === '' && getPolicy(cat.value)) {
        await removePolicy(cat.value as Category)
      }
    }
    toast.add({ title: 'Policies saved', color: 'success', icon: 'i-heroicons-shield-check' })
  } catch (e: any) {
    toast.add({ title: 'Failed to save', description: e?.data?.message ?? e?.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    savingPolicies.value = false
  }
}

async function onRemovePolicy(category: Category) {
  policyDrafts[category] = ''
  await removePolicy(category)
}
</script>
