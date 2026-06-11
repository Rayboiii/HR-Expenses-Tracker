import sql from 'mssql'

export default defineEventHandler(async (event) => {
  await requireManager(event)
  const category = getRouterParam(event, 'category')
  const body = await readBody(event)
  const max = Number(body?.max)
  const userId = Number(body?.userId)

  if (!category || isNaN(max) || max <= 0 || !userId) {
    throw createError({ statusCode: 400, message: 'category, max, and userId are required' })
  }

  const db = await getDb()
  await db.request()
    .input('userId',   sql.Int,          userId)
    .input('category', sql.NVarChar(50), category)
    .input('max',      sql.Decimal(10, 2), max)
    .query(`
      MERGE INTO policies AS target
      USING (SELECT @userId AS user_id, @category AS category) AS source
        ON target.user_id = source.user_id AND target.category = source.category
      WHEN MATCHED THEN
        UPDATE SET max_amount = @max
      WHEN NOT MATCHED THEN
        INSERT (user_id, category, max_amount) VALUES (@userId, @category, @max);
    `)

  return { ok: true }
})
