import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id: sessionUserId, role } = session.user as { id: number; role: string }
  const query = getQuery(event)
  const userId = role === 'manager' && query.userId ? Number(query.userId) : sessionUserId

  const db = await getDb()
  const result = await db.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT category, CAST(limit_amount AS FLOAT) AS limit FROM budgets WHERE user_id = @userId`)

  return result.recordset
})
