import express from 'express'
import * as controller from '../controllers/ledgerEntryController'
import { authMiddleware } from '../middleware/authMiddleware'
import { authorizeRoles } from '../middleware/roleMiddleware'

const ledgerEntryRouter = express.Router()

ledgerEntryRouter.post(
  '/ledgerEntries',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER'),
  controller.createLedgerEntry
)
ledgerEntryRouter.post(
  '/ledgerEntries/reversal/:id',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER'),
  controller.createLedgerReversal
)
ledgerEntryRouter.get(
  '/ledgerEntries',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER', 'PASTOR', 'MINISTRY_LEADER'),
  controller.getAllLedgerEntries
)
ledgerEntryRouter.get(
  '/ledgerEntries/:id',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER', 'PASTOR', 'MINISTRY_LEADER'),
  controller.getLedgerEntry
)
ledgerEntryRouter.patch(
  '/ledgerEntries/:id',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER'),
  controller.updateLedgerEntry
)
ledgerEntryRouter.delete(
  '/ledgerEntries/:id',
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'FINANCE_OFFICER'),
  controller.deleteLedgerEntry
)

export default ledgerEntryRouter
