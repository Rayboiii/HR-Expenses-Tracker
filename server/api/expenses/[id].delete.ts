import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id: userId, role } = session.user as { id: number; role: string }

  const id = getRouterParam(event, 'id')
  const ownerCheck = role !== 'manager' ? 'AND user_id = @userId' : ''

  const db = await getDb()
  const result = await db.request()
    .input('id',     sql.UniqueIdentifier, id)
    .input('userId', sql.Int,              userId)
    .query(`DELETE FROM expenses WHERE id = @id ${ownerCheck}`)

  if (result.rowsAffected[0] === 0) {
    throw createError({ statusCode: 404, message: 'Expense not found' })
  }
  return { ok: true }
})
