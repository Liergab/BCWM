import express from 'express'
import request from 'supertest'
import ledgerEntryRouter from '../../routes/ledgerEntryRoutes'
import { errorValidation } from '../../middleware/error'
import LedgerEntryService from '../../services/ledgerEntryServices'

jest.mock('../../services/ledgerEntryServices', () => ({
  __esModule: true,
  default: {
    createLedgerEntry: jest.fn(),
    createReversal: jest.fn(),
    getAllLedgerEntries: jest.fn(),
    getLedgerEntryById: jest.fn(),
  },
}))

jest.mock('../../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    if (req.headers['x-test-auth'] === 'off') {
      res.status(401).json({ message: 'Not Authorized, No token' })
      return
    }
    req.user = {
      id: '507f1f77bcf86cd799439011',
      role: req.headers['x-test-role'] || 'FINANCE_OFFICER',
    }
    next()
  },
}))

const ledgerServiceMock = LedgerEntryService as unknown as {
  createLedgerEntry: jest.Mock
  createReversal: jest.Mock
  getAllLedgerEntries: jest.Mock
  getLedgerEntryById: jest.Mock
}

describe('LedgerEntry API response contracts', () => {
  const app = express()
  app.use(express.json())
  app.use('/v1/api', ledgerEntryRouter)
  app.use(errorValidation)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /ledgerEntries returns created entry for finance officer', async () => {
    ledgerServiceMock.createLedgerEntry.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439012',
      transactionId: 'LED-1',
      runningBalance: 500,
    })

    const response = await request(app)
      .post('/v1/api/ledgerEntries')
      .set('x-test-role', 'FINANCE_OFFICER')
      .send({
        type: 'TITHE',
        amount: 500,
        paymentMode: 'CASH',
      })

    expect(response.status).toBe(201)
    expect(response.body.data.transactionId).toBe('LED-1')
  })

  it('POST /ledgerEntries blocks non-finance role', async () => {
    const response = await request(app)
      .post('/v1/api/ledgerEntries')
      .set('x-test-role', 'MEMBER')
      .send({
        type: 'TITHE',
        amount: 500,
        paymentMode: 'CASH',
      })

    expect(response.status).toBe(403)
    expect(response.body.message).toContain('Forbidden')
  })

  it('POST /ledgerEntries/reversal/:id returns reversal entry', async () => {
    ledgerServiceMock.createReversal.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439013',
      transactionId: 'REV-1',
      runningBalance: 100,
    })

    const response = await request(app)
      .post('/v1/api/ledgerEntries/reversal/507f1f77bcf86cd799439012')
      .set('x-test-role', 'SUPER_ADMIN')
      .send({ note: 'Reversal test' })

    expect(response.status).toBe(201)
    expect(response.body.data.transactionId).toBe('REV-1')
  })

  it('GET /ledgerEntries allows pastor read access', async () => {
    ledgerServiceMock.getAllLedgerEntries.mockResolvedValueOnce({
      data: [{ id: '507f1f77bcf86cd799439014' }],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    })

    const response = await request(app)
      .get('/v1/api/ledgerEntries')
      .set('x-test-role', 'PASTOR')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  it('GET /ledgerEntries requires authentication', async () => {
    const response = await request(app)
      .get('/v1/api/ledgerEntries')
      .set('x-test-auth', 'off')

    expect(response.status).toBe(401)
  })

  it('PATCH /ledgerEntries/:id is blocked by immutability', async () => {
    const response = await request(app)
      .patch('/v1/api/ledgerEntries/507f1f77bcf86cd799439015')
      .set('x-test-role', 'FINANCE_OFFICER')
      .send({ note: 'edit' })

    expect(response.status).toBe(405)
    expect(response.body.message).toContain('immutable')
  })

  it('DELETE /ledgerEntries/:id is blocked by immutability', async () => {
    const response = await request(app)
      .delete('/v1/api/ledgerEntries/507f1f77bcf86cd799439015')
      .set('x-test-role', 'FINANCE_OFFICER')

    expect(response.status).toBe(405)
    expect(response.body.message).toContain('cannot be deleted')
  })
})
