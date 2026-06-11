<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="w-full max-w-sm space-y-6">
      <!-- Logo -->
      <div class="text-center">
        <div class="size-12 rounded-xl flex items-center justify-center mx-auto mb-3" style="background: var(--ui-color-primary-500)">
          <UIcon name="i-heroicons-banknotes" class="size-6 text-white" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
      </div>

      <UCard>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="block text-sm font-medium mb-1.5">Email</label>
            <UInput v-model="form.email" type="email" placeholder="you@company.com" autocomplete="email" class="w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Password</label>
            <UInput v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" class="w-full" required />
          </div>

          <UAlert v-if="error" color="error" variant="subtle" :description="error" />

          <UButton type="submit" label="Sign in" class="w-full justify-center" :loading="loading" />
        </form>
      </UCard>

      <p class="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?
        <NuxtLink to="/register" class="font-medium text-primary-600 hover:underline">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })  // Use no layout on auth pages

const { fetch: refreshSession } = useUserSession()
const router = useRouter()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshSession()
    router.push('/')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
