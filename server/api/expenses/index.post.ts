import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = (session.user as { id: number }).id

  const body = await readBody(event)
  if (!body?.title || !body?.amount || !body?.category || !body?.date) {
    throw createError({ statusCode: 400, message: 'title, amount, category and date are required' })
  }

  const db = await getDb()
  const result = await db.request()
    .input('userId',   sql.Int,              userId)
    .input('title',    sql.NVarChar(255),     body.title)
    .input('amount',   sql.Decimal(10, 2),    body.amount)
    .input('category', sql.NVarChar(50),      body.category)
    .input('date',     sql.Date,              body.date)
    .input('note',     sql.NVarChar(sql.MAX), body.note ?? null)
    .query(`
      INSERT INTO expenses (user_id, title, amount, category, date, note)
      OUTPUT
        LOWER(CAST(INSERTED.id AS VARCHAR(36))) AS id,
        INSERTED.title,
        CAST(INSERTED.amount AS FLOAT)          AS amount,
        INSERTED.category,
        CONVERT(VARCHAR(10), INSERTED.date, 23) AS date,
        INSERTED.note,
        INSERTED.status,
        INSERTED.user_id                        AS userId,
        INSERTED.created_at                     AS createdAt
      VALUES (@userId, @title, @amount, @category, @date, @note)
    `)

  return { ...result.recordset[0], claimHistory: [] }
})
