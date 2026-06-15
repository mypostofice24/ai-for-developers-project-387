export type AppConfig = {
  corsOrigin: string
  frontendDistDir: string
  host: string
  port: number
}

const parsePort = (value: string | undefined) => {
  const port = Number(value || 3001)

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer from 1 to 65535.')
  }

  return port
}

export const getConfig = (): AppConfig => ({
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  frontendDistDir: process.env.FRONTEND_DIST_DIR || `${process.cwd()}/public`,
  host: process.env.HOST || '0.0.0.0',
  port: parsePort(process.env.PORT),
})
