import sql from 'mssql'

let pool: sql.ConnectionPool | null = null

export async function getDb(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool

  const config = useRuntimeConfig()

  pool = await sql.connect({
    server: config.dbServer as string,
    database: config.dbName as string,
    authentication: {
      type: 'default',
      options: {
        userName: config.dbUser as string,
        password: config.dbPassword as string,
      },
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,   // max simultaneous connections
      min: 0,
      idleTimeoutMillis: 30000,
    },
  })

  return pool
}
