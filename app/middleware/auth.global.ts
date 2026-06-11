export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()
  const publicRoutes = ['/login', '/register']

  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (loggedIn.value && publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  // Managers must pick an employee before accessing any page
  if (loggedIn.value && (user.value as any)?.role === 'manager' && to.path !== '/select-employee') {
    const { selected } = useSelectedEmployee()
    if (!selected.value) {
      return navigateTo('/select-employee')
    }
  }
})
