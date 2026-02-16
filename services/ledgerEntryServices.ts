import LedgerEntryRepository, { LedgerEntryEntity } from '../repository/ledgerEntryRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreateLedgerEntryDTO,
  CreateLedgerReversalDTO,
  GetLedgerEntriesQueryDTO,
  GetLedgerEntriesQueryParamsDTO,
  GetLedgerEntryQueryDTO,
} from '../util/validation/ledgerEntryZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class LedgerEntryService {
  private signedAmountForType(type: CreateLedgerEntryDTO["type"], amount: number): number {
    if (type === 'EXPENSE' || type === 'REVERSAL') {
      return -Math.abs(amount)
    }
    return Math.abs(amount)
  }

  private generateTransactionId(prefix = 'LED'): string {
    const timePart = Date.now().toString()
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    return `${prefix}-${timePart}-${randomPart}`
  }

  private async getLatestRunningBalance(): Promise<number> {
    const latest = await LedgerEntryRepository.docs({
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
      take: 1,
    } as any)
    if (!latest.length) {
      return 0
    }
    return latest[0].runningBalance ?? 0
  }

  async createLedgerEntry(data: CreateLedgerEntryDTO, enteredByUserId: string): Promise<LedgerEntryEntity> {
    if (!enteredByUserId) {
      throw new Error('enteredByUserId is required')
    }

    const signedAmount = this.signedAmountForType(data.type, data.amount)
    const previousBalance = await this.getLatestRunningBalance()
    const runningBalance = previousBalance + signedAmount

    return (await LedgerEntryRepository.add({
      transactionId: this.generateTransactionId('LED'),
      entryDate: data.entryDate || new Date(),
      type: data.type,
      amount: Math.abs(data.amount),
      signedAmount,
      runningBalance,
      serviceName: data.serviceName,
      paymentMode: data.paymentMode,
      note: data.note,
      enteredByUserId,
      createdAt: new Date(),
    } as any)) as LedgerEntryEntity
  }

  async createReversal(
    ledgerEntryId: string,
    data: CreateLedgerReversalDTO,
    enteredByUserId: string
  ): Promise<LedgerEntryEntity> {
    if (!enteredByUserId) {
      throw new Error('enteredByUserId is required')
    }

    const originalEntry = await LedgerEntryRepository.doc(ledgerEntryId)
    if (!originalEntry) {
      throw new Error('Original ledger entry not found')
    }

    const reversalAmount = Math.abs(originalEntry.amount)
    const signedAmount = -Math.abs(reversalAmount)
    const previousBalance = await this.getLatestRunningBalance()
    const runningBalance = previousBalance + signedAmount

    return (await LedgerEntryRepository.add({
      transactionId: this.generateTransactionId('REV'),
      entryDate: new Date(),
      type: 'REVERSAL',
      amount: reversalAmount,
      signedAmount,
      runningBalance,
      serviceName: originalEntry.serviceName,
      paymentMode: originalEntry.paymentMode,
      note: data.note || `Reversal for transaction ${originalEntry.transactionId}`,
      enteredByUserId,
      reversalOfId: originalEntry.id,
      createdAt: new Date(),
    } as any)) as LedgerEntryEntity
  }

  async getAllLedgerEntries(
    query: GetLedgerEntriesQueryParamsDTO | GetLedgerEntriesQueryDTO = {}
  ): Promise<{ data: LedgerEntryEntity[]; pagination: PaginationMeta }> {
    const where: any = {}
    const q = query as GetLedgerEntriesQueryParamsDTO & GetLedgerEntriesQueryDTO
    if (q.type) where.type = q.type
    if (q.paymentMode) where.paymentMode = q.paymentMode
    if (q.serviceName) where.serviceName = { contains: q.serviceName, mode: 'insensitive' }
    if (q.from || q.to) {
      where.entryDate = {}
      if (q.from) where.entryDate.gte = new Date(q.from)
      if (q.to) where.entryDate.lte = new Date(q.to)
    }
    const { where: mergedWhere, orderBy } = applyListQueryParams(where, q)
    const selectFields = parseSelectFields((q as any).select, (q as any).selects)
    const dbParams: any = {
      where: mergedWhere,
      orderBy: orderBy ?? { entryDate: 'asc' as const },
    }
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    const page = (q as any).page ?? 1
    const limit = (q as any).limit ?? 10
    dbParams.skip = (page - 1) * limit
    dbParams.take = limit
    const [data, total] = await Promise.all([
      LedgerEntryRepository.docs(dbParams),
      LedgerEntryRepository.count(mergedWhere),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getLedgerEntryById(id: string, query: GetLedgerEntryQueryDTO = {}): Promise<LedgerEntryEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await LedgerEntryRepository.doc(id, dbParams)
  }

  async updateLedgerEntry(_id: string, _data: Partial<CreateLedgerEntryDTO>): Promise<LedgerEntryEntity | null> {
    throw new Error('Ledger entries are immutable. Use reversal entries for corrections.')
  }

  async deleteLedgerEntry(_id: string): Promise<LedgerEntryEntity | null> {
    throw new Error('Ledger entries are immutable and cannot be deleted.')
  }
}

export default new LedgerEntryService()
