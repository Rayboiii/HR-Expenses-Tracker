import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id: userId, role } = session.user as { id: number; role: string }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!body?.title || !body?.amount || !body?.category || !body?.date) {
    throw createError({ statusCode: 400, message: 'title, amount, category and date are required' })
  }

  const db = await getDb()

  // Managers can edit any expense; employees only their own
  const ownerCheck = role !== 'manager' ? 'AND user_id = @userId' : ''
  const result = await db.request()
    .input('id',       sql.UniqueIdentifier,  id)
    .input('userId',   sql.Int,               userId)
    .input('title',    sql.NVarChar(255),     body.title)
    .input('amount',   sql.Decimal(10, 2),    body.amount)
    .input('category', sql.NVarChar(50),      body.category)
    .input('date',     sql.Date,              body.date)
    .input('note',     sql.NVarChar(sql.MAX), body.note ?? null)
    .query(`
      UPDATE expenses
      SET title = @title, amount = @amount, category = @category,
          date = @date, note = @note, updated_at = GETDATE()
      WHERE id = @id ${ownerCheck}
    `)

  if (result.rowsAffected[0] === 0) {
    throw createError({ statusCode: 404, message: 'Expense not found' })
  }
  return { ok: true }
})
