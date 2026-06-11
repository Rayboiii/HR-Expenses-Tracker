export interface AppUser {
  id: number
  name: string
  email: string
}

export function useUsers() {
  const { data, pending, error } = useAsyncData<AppUser[]>(
    'app-users',
    () => $fetch<AppUser[]>('/api/users'),
    { default: (): AppUser[] => [], server: false, lazy: true },
  )

  return {
    users: computed(() => data.value ?? []),
    pending,
    error,
  }
}
