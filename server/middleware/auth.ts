export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only protect /api routes — let auth endpoints through
  if (!url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/api/auth/')) return
  if (url.pathname === '/api/health') return

  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'You must be logged in' })
  }
})
