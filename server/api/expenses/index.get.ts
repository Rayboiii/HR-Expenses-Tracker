import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id: userId, role } = session.user as { id: number; role: string }
  const isManager = role === 'manager'

  const db = await getDb()
  const req = db.request()

  // Managers see all expenses; employees see only their own
  let whereClause = ''
  if (!isManager) {
    req.input('userId', sql.Int, userId)
    whereClause = 'WHERE e.user_id = @userId'
  }

  const [expensesResult, historyResult] = await Promise.all([
    req.query(`
      SELECT
        LOWER(CAST(e.id AS VARCHAR(36)))   AS id,
        e.title,
        CAST(e.amount AS FLOAT)            AS amount,
        e.category,
        CONVERT(VARCHAR(10), e.date, 23)   AS date,
        e.note,
        e.status,
        e.claim_note    AS claimNote,
        e.receipt,
        e.submitted_by  AS submittedBy,
        e.user_id       AS userId,
        e.created_at    AS createdAt
      FROM expenses e
      ${whereClause}
      ORDER BY e.date DESC, e.created_at DESC
    `),
    db.request().query(`
      SELECT
        LOWER(CAST(expense_id AS VARCHAR(36))) AS expenseId,
        status,
        comment,
        created_at AS timestamp
      FROM claim_history
      ORDER BY created_at ASC
    `),
  ])

  const historyMap = new Map<string, { status: string; timestamp: Date; comment?: string }[]>()
  for (const h of historyResult.recordset) {
    if (!historyMap.has(h.expenseId)) historyMap.set(h.expenseId, [])
    historyMap.get(h.expenseId)!.push({
      status: h.status,
      timestamp: h.timestamp,
      ...(h.comment ? { comment: h.comment } : {}),
    })
  }

  return expensesResult.recordset.map(e => ({
    ...e,
    claimHistory: historyMap.get(e.id) ?? [],
  }))
})
