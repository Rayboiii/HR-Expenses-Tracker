import sql from 'mssql'

export default defineEventHandler(async (event) => {
  await requireManager(event)

  const session = await getUserSession(event)
  const { id: currentUserId } = session.user as { id: number }

  const db = await getDb()
  const result = await db.request()
    .input('currentUserId', sql.Int, currentUserId)
    .query<{ id: number; name: string; email: string }>(`
      SELECT id, name, email FROM users WHERE id != @currentUserId ORDER BY name
    `)

  return result.recordset
})
