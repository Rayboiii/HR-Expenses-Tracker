import sql from 'mssql'

export default defineEventHandler(async (event) => {
  await requireManager(event)
  const category = getRouterParam(event, 'category')
  const query = getQuery(event)
  const userId = Number(query.userId)

  if (!userId) {
    throw createError({ statusCode: 400, message: 'userId is required' })
  }

  const db = await getDb()
  await db.request()
    .input('userId',   sql.Int,          userId)
    .input('category', sql.NVarChar(50), category)
    .query('DELETE FROM budgets WHERE user_id = @userId AND category = @category')

  return { ok: true }
})
