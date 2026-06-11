import sql from 'mssql'

export default defineEventHandler(async (event) => {
  await requireManager(event)
  const category = getRouterParam(event, 'category')
  const body = await readBody(event)
  const limit = Number(body?.limit)
  const userId = Number(body?.userId)

  if (!category || isNaN(limit) || limit <= 0 || !userId) {
    throw createError({ statusCode: 400, message: 'category, limit, and userId are required' })
  }

  const db = await getDb()
  await db.request()
    .input('userId',   sql.Int,           userId)
    .input('category', sql.NVarChar(50),  category)
    .input('limit',    sql.Decimal(10, 2), limit)
    .query(`
      MERGE INTO budgets AS target
      USING (SELECT @userId AS user_id, @category AS category) AS source
        ON target.user_id = source.user_id AND target.category = source.category
      WHEN MATCHED THEN
        UPDATE SET limit_amount = @limit
      WHEN NOT MATCHED THEN
        INSERT (user_id, category, limit_amount) VALUES (@userId, @category, @limit);
    `)

  return { ok: true }
})
