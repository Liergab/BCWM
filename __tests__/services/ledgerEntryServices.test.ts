import LedgerEntryService from '../../services/ledgerEntryServices'
import LedgerEntryRepository from '../../repository/ledgerEntryRepository'

jest.mock('../../repository/ledgerEntryRepository', () => ({
  __esModule: true,
  default: {
    add: jest.fn(),
    docs: jest.fn(),
    doc: jest.fn(),
  },
}))

const ledgerRepoMock = LedgerEntryRepository as unknown as {
  add: jest.Mock
  docs: jest.Mock
  doc: jest.Mock
}

describe('LedgerEntryService immutable ledger flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('computes running balance for positive entry', async () => {
    ledgerRepoMock.docs.mockResolvedValueOnce([])
    ledgerRepoMock.add.mockImplementationOnce(async (data) => data)

    const result = await LedgerEntryService.createLedgerEntry(
      { type: 'TITHE', amount: 500, paymentMode: 'CASH' },
      '507f1f77bcf86cd799439011'
    )

    expect(result.signedAmount).toBe(500)
    expect(result.runningBalance).toBe(500)
  })

  it('computes running balance for expense entry', async () => {
    ledgerRepoMock.docs.mockResolvedValueOnce([{ runningBalance: 800 }])
    ledgerRepoMock.add.mockImplementationOnce(async (data) => data)

    const result = await LedgerEntryService.createLedgerEntry(
      { type: 'EXPENSE', amount: 200, paymentMode: 'CASH' },
      '507f1f77bcf86cd799439011'
    )

    expect(result.signedAmount).toBe(-200)
    expect(result.runningBalance).toBe(600)
  })

  it('creates reversal entry using original amount and new tally', async () => {
    ledgerRepoMock.doc.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439012',
      transactionId: 'LED-123',
      amount: 500,
      serviceName: 'Sunday Service',
      paymentMode: 'CASH',
    })
    ledgerRepoMock.docs.mockResolvedValueOnce([{ runningBalance: 600 }])
    ledgerRepoMock.add.mockImplementationOnce(async (data) => data)

    const result = await LedgerEntryService.createReversal(
      '507f1f77bcf86cd799439012',
      { note: 'Reverse tithe' },
      '507f1f77bcf86cd799439011'
    )

    expect(result.type).toBe('REVERSAL')
    expect(result.signedAmount).toBe(-500)
    expect(result.runningBalance).toBe(100)
    expect(result.reversalOfId).toBe('507f1f77bcf86cd799439012')
  })

  it('blocks update for immutable ledger', async () => {
    await expect(
      LedgerEntryService.updateLedgerEntry('507f1f77bcf86cd799439012', { note: 'edit' } as any)
    ).rejects.toThrow('immutable')
  })

  it('blocks delete for immutable ledger', async () => {
    await expect(
      LedgerEntryService.deleteLedgerEntry('507f1f77bcf86cd799439012')
    ).rejects.toThrow('cannot be deleted')
  })
})
