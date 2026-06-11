import type { H3Event } from 'h3'

export async function requireManager(event: H3Event): Promise<void> {
  const session = await getUserSession(event)
  const role = (session.user as { role?: string } | undefined)?.role
  if (role !== 'manager') {
    throw createError({ statusCode: 403, message: 'Manager access required' })
  }
}
