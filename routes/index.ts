import express from 'express'
import userRouter from './userRoutes'
import personRouter from './personRoutes'
import healthRouter from './healthRoutes'
import churchConfigRouter from './churchConfigRoutes'
import memberRouter from './memberRoutes'
import ledgerEntryRouter from './ledgerEntryRoutes'
import ministryRouter from './ministryRoutes'
import eventRouter from './eventRoutes'
const router = express.Router()

router.use(healthRouter)
router.use(personRouter)
router.use(userRouter)

router.use(churchConfigRouter)

router.use(memberRouter)

router.use(ledgerEntryRouter)

router.use(ministryRouter)

router.use(eventRouter)

export default router