import bcrypt from 'bcrypt'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const db = await getDb()
  const result = await db.request()
    .input('email', sql.NVarChar(255), email.trim().toLowerCase())
    .query('SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = @email')

  const user = result.recordset[0]

  // Same error for wrong email or wrong password — avoids user enumeration
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role }
  await setUserSession(event, { user: sessionUser })

  return { user: sessionUser }
})
