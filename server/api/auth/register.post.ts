import bcrypt from 'bcrypt'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const { name, email, password, role } = await readBody(event)

  if (!name?.trim() || !email?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Name, email and password are required' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password must be at least 8 characters' })
  }
  const validRoles = ['employee', 'manager']
  const userRole = validRoles.includes(role) ? role : 'employee'

  const db = await getDb()

  // Check email not already taken
  const existing = await db.request()
    .input('email', sql.NVarChar(255), email.trim().toLowerCase())
    .query('SELECT id FROM users WHERE email = @email')
  if (existing.recordset.length > 0) {
    throw createError({ statusCode: 409, message: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const result = await db.request()
    .input('name',         sql.NVarChar(255), name.trim())
    .input('email',        sql.NVarChar(255), email.trim().toLowerCase())
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('role',         sql.NVarChar(20),  userRole)
    .query(`
      INSERT INTO users (name, email, password_hash, role)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
      VALUES (@name, @email, @passwordHash, @role)
    `)

  const user = result.recordset[0]
  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email, role: user.role } })

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
})
