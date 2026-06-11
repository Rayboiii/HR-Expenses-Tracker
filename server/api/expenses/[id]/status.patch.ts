import sql from 'mssql'

const VALID_STATUSES = ['personal', 'pending', 'approved', 'reimbursed', 'rejected']

// What each role is allowed to set
const EMPLOYEE_ALLOWED = ['personal', 'pending']  // submit or withdraw
const MANAGER_ALLOWED  = ['approved', 'reimbursed', 'rejected', 'personal', 'pending']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id: userId, role } = session.user as { id: number; role: string }
  const isManager = role === 'manager'

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status, claimNote, receipt, submittedBy, comment } = body ?? {}

  if (!status || !VALID_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const allowed = isManager ? MANAGER_ALLOWED : EMPLOYEE_ALLOWED
  if (!allowed.includes(status)) {
    throw createError({ statusCode: 403, message: 'You do not have permission to set this status' })
  }

  const db = await getDb()
  const req = db.request()
    .input('id',      sql.UniqueIdentifier,  id)
    .input('userId',  sql.Int,               userId)
    .input('status',  sql.NVarChar(20),      status)
    .input('comment', sql.NVarChar(sql.MAX), comment ?? null)

  // Employees can only update their own expenses
  const ownerCheck = isManager ? '' : 'AND user_id = @userId'

  const extraSets: string[] = []
  if (claimNote !== undefined) {
    req.input('claimNote', sql.NVarChar(sql.MAX), claimNote ?? null)
    extraSets.push('claim_note = @claimNote')
  }
  if (receipt !== undefined) {
    req.input('receipt', sql.NVarChar(sql.MAX), receipt ?? null)
    extraSets.push('receipt = @receipt')
  }
  if (submittedBy !== undefined) {
    req.input('submittedBy', sql.NVarChar(255), submittedBy ?? null)
    extraSets.push('submitted_by = @submittedBy')
  }

  const extraSetClause = extraSets.length ? ', ' + extraSets.join(', ') : ''

  const result = await req.query(`
    UPDATE expenses
    SET status = @status, updated_at = GETDATE()${extraSetClause}
    WHERE id = @id ${ownerCheck};

    INSERT INTO claim_history (expense_id, status, comment)
    VALUES (@id, @status, @comment);
  `)

  if (result.rowsAffected[0] === 0) {
    throw createError({ statusCode: 404, message: 'Expense not found or access denied' })
  }

  return { ok: true }
})
