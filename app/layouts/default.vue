<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Navbar -->
      <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2.5 font-bold text-base tracking-tight">
            <div class="size-8 rounded-lg flex items-center justify-center" style="background: var(--ui-color-primary-500)">
              <UIcon name="i-heroicons-banknotes" class="size-4 text-white" />
            </div>
            <span>ExpenseTracker</span>
          </NuxtLink>

          <nav class="flex items-center gap-1">
            <UButton
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :label="link.label"
              :icon="link.icon"
              :color="route.path === link.to ? 'primary' : 'neutral'"
              :variant="route.path === link.to ? 'soft' : 'ghost'"
              size="sm"
            />

            <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <UColorModeButton size="sm" />

            <!-- User menu -->
            <UDropdownMenu v-if="loggedIn" :items="userMenuItems">
              <UButton variant="ghost" color="neutral" size="sm" class="gap-1.5">
                <div class="size-6 rounded-full flex items-center justify-center text-xs font-bold" style="background: var(--ui-color-primary-100); color: var(--ui-color-primary-700)">
                  {{ userInitial }}
                </div>
                <span class="hidden sm:inline text-sm max-w-24 truncate">{{ user?.name }}</span>
                <UBadge v-if="user?.role === 'manager'" label="Manager" color="primary" variant="subtle" size="xs" class="hidden sm:flex" />
              </UButton>
            </UDropdownMenu>
          </nav>
        </div>
      </header>

      <!-- Manager: viewing context bar -->
      <div
        v-if="isManager && selectedEmployee"
        class="bg-primary-50 dark:bg-primary-950/40 border-b border-primary-100 dark:border-primary-900"
      >
        <div class="max-w-4xl mx-auto px-4 py-1.5 flex items-center gap-2">
          <UIcon name="i-heroicons-eye" class="size-3.5 text-primary-500 shrink-0" />
          <span class="text-xs text-primary-700 dark:text-primary-300">
            Viewing <strong>{{ selectedEmployee.name }}</strong>
          </span>
          <UButton
            label="Change"
            variant="link"
            size="xs"
            color="primary"
            class="ml-1"
            @click="changeEmployee"
          />
        </div>
      </div>

      <!-- Page content -->
      <main class="max-w-4xl mx-auto px-4 py-8">
        <slot />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { loggedIn, user } = useUserSession()
const isManager = computed(() => (user.value as any)?.role === 'manager')
const { selected: selectedEmployee, clear: clearEmployee } = useSelectedEmployee()

function changeEmployee() {
  clearEmployee()
  router.push('/select-employee')
}

const navLinks = [
  { to: '/',         label: 'Dashboard', icon: 'i-heroicons-chart-pie' },
  { to: '/expenses', label: 'Expenses',  icon: 'i-heroicons-list-bullet' },
  { to: '/budgets',  label: 'Budgets',   icon: 'i-heroicons-wallet' },
  { to: '/claims',   label: 'Claims',    icon: 'i-heroicons-arrow-up-on-square' },
  { to: '/expenses/new', label: 'Add',   icon: 'i-heroicons-plus-circle' },
]

const userInitial = computed(() =>
  (user.value?.name as string | undefined)?.charAt(0).toUpperCase() ?? '?',
)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

const userMenuItems = computed(() => [[
  {
    label: user.value?.email as string ?? '',
    disabled: true,
  },
], [
  {
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    onSelect: logout,
  },
]])
</script>
