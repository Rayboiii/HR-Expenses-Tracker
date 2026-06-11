export default defineEventHandler(async () => {
  const db = await getDb()
  const result = await db.request().query('SELECT GETDATE() AS now, DB_NAME() AS database_name')
  return {
    ok: true,
    database: result.recordset[0].database_name,
    serverTime: result.recordset[0].now,
  }
})
