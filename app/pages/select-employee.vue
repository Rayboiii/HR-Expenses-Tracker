<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="size-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background: var(--ui-color-primary-500)">
          <UIcon name="i-heroicons-users" class="size-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Select Employee</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose whose expenses you want to review
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="size-6 text-gray-400 animate-spin" />
      </div>

      <!-- Empty -->
      <div v-else-if="!users.length" class="text-center py-12 text-sm text-gray-400">
        No other employees registered yet.
      </div>

      <!-- User grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="u in users"
          :key="u.id"
          class="group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-left transition-all hover:border-primary-400 hover:shadow-md hover:shadow-primary-100 dark:hover:border-primary-600 dark:hover:shadow-primary-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          @click="onSelect(u)"
        >
          <!-- Avatar -->
          <div
            class="size-11 rounded-full flex items-center justify-center shrink-0 text-base font-bold transition-colors"
            style="background: var(--ui-color-primary-100); color: var(--ui-color-primary-700)"
          >
            {{ u.name.charAt(0).toUpperCase() }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">{{ u.name }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ u.email }}</p>
          </div>

          <UIcon
            name="i-heroicons-arrow-right"
            class="size-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors shrink-0"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { users, pending } = useUsers()
const { select } = useSelectedEmployee()
const router = useRouter()

function onSelect(u: { id: number; name: string; email: string }) {
  select(u)
  router.push('/')
}
</script>
