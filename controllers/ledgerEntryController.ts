import { NextFunction, Request, Response } from 'express'
import LedgerEntryService from '../services/ledgerEntryServices'
import { LedgerEntryValidationSchemas } from '../util/validation/ledgerEntryZod'

export const createLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = LedgerEntryValidationSchemas.createLedgerEntry.parse(req.body)
    const enteredByUserId = req.user?.id || req.body.enteredByUserId
    const created = await LedgerEntryService.createLedgerEntry(payload, enteredByUserId)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const createLedgerReversal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = LedgerEntryValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = LedgerEntryValidationSchemas.createReversal.parse(req.body)
    const enteredByUserId = req.user?.id || req.body.enteredByUserId
    const created = await LedgerEntryService.createReversal(id, payload, enteredByUserId)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllLedgerEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = LedgerEntryValidationSchemas.getQueriesParams.parse({
      select: req.query.select,
      selects: req.query.selects,
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter,
      sort: req.query.sort,
      queryArray: req.query.queryArray,
      queryArrayType: req.query.queryArrayType,
      type: req.query.type,
      paymentMode: req.query.paymentMode,
      from: req.query.from,
      to: req.query.to,
      serviceName: req.query.serviceName,
    })
    const { data, pagination } = await LedgerEntryService.getAllLedgerEntries(query)
    res.status(200).json({ data, pagination })
  } catch (error) {
    next(error)
  }
}

export const getLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = LedgerEntryValidationSchemas.idParam.parse({ id: req.params.id })
    const query = LedgerEntryValidationSchemas.getQueryParams.parse({
      select: req.query.select,
      selects: req.query.selects,
    })
    const data = await LedgerEntryService.getLedgerEntryById(id, query)
    if (!data) {
      res.status(404).json({ message: 'LedgerEntry not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updateLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(405).json({ message: 'Ledger entries are immutable. Use reversal entries for corrections.' })
}

export const deleteLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(405).json({ message: 'Ledger entries are immutable and cannot be deleted.' })
}
