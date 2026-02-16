import { GenericRepository } from './genericRepository'

export interface LedgerEntryEntity {
  id: string
  transactionId: string
  entryDate: Date
  type: "OPENING_BALANCE" | "TITHE" | "OFFERING" | "DONATION" | "EXPENSE" | "REVERSAL"
  amount: number
  signedAmount: number
  runningBalance: number
  serviceName?: string | null
  paymentMode: "CASH" | "BANK" | "MOBILE"
  note?: string | null
  enteredByUserId: string
  reversalOfId?: string | null
  createdAt: Date
}

class LedgerEntryRepository extends GenericRepository<LedgerEntryEntity> {
  constructor() {
    super('ledgerEntry')
  }
}

export default new LedgerEntryRepository()
