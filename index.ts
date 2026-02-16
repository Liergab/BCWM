import express      from 'express'
import { createServer } from 'http'
import { AddressInfo } from 'net'
import env          from './util/validate'
import db, { disconnectDB } from './config/db'
import index        from './routes/index'
import cookieParser from 'cookie-parser'
import cors         from 'cors'
import helmet       from 'helmet'
import compression  from 'compression'
import rateLimit    from 'express-rate-limit'
import logger       from './config/logger'
import morganMiddleware from './middleware/morganMiddleware'
import { errorValidation,
         NotFoundEndpoint } from './middleware/error'
import { initSocketServer } from './socket/socketServer'

const app = express()
const httpServer = createServer(app)

const PORT = env.PORT

const describeAddress = () => {
  const address = httpServer.address()
  if (!address) return `http://localhost:${PORT}`
  if (typeof address === 'string') return address
  const info = address as AddressInfo
  return `http://localhost:${info.port}`
}

const printPortKillHelp = (port: number) => {
  const findCommand = `Get-NetTCPConnection -LocalPort ${port} -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess`
  const killCommand = `$pid = (Get-NetTCPConnection -LocalPort ${port} -State Listen).OwningProcess; Stop-Process -Id $pid -Force`

  console.error('PowerShell commands to free the port:')
  console.error(`1) Find PID: ${findCommand}`)
  console.error(`2) Kill PID: ${killCommand}`)
}

// HTTP request logger
app.use(morganMiddleware)

// Security middleware - Helmet (sets various HTTP headers)
app.use(helmet())

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Compression middleware for response optimization
app.use(compression())

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(cors())


app.use('/v1/api', index)
app.use(NotFoundEndpoint)
app.use(errorValidation)

const io = initSocketServer(httpServer)

httpServer.listen(PORT, () => {
    logger.info(`Server running on ${describeAddress()}`)
    logger.info(`Socket.IO server ready on ws://localhost:${PORT}`)
    db()
})

httpServer.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    const message = `Port ${PORT} is already in use. Stop the existing process or change PORT in .env`
    logger.error(message)
    console.error(message)
    printPortKillHelp(PORT)
    process.exit(1)
  }

  logger.error('HTTP server startup error:', error)
  console.error('HTTP server startup error:', error)
  process.exit(1)
})

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  io.close()

  httpServer.close(() => {
    logger.info('HTTP server closed')

    // Close Prisma database connection
    disconnectDB().then(() => {
      logger.info('Database connection closed')
      process.exit(0)
    }).catch((err: Error) => {
      logger.error('Error during database shutdown:', err)
      process.exit(1)
    })
  })

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error)
  console.error('Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection:', reason)
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})