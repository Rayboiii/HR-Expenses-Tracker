import type { AppUser } from './useUsers'

export function useSelectedEmployee() {
  const selected = useState<AppUser | null>('selectedEmployee', () => null)

  return {
    selected,
    select: (user: AppUser) => { selected.value = user },
    clear: () => { selected.value = null },
  }
}
