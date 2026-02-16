import express from 'express'
import userRouter from './userRoutes'
import healthRouter from './healthRoutes'import personRouter from './personRoutes'
const router = express.Router()

router.use(healthRouter)
router.use(userRouter)router.use(personRouter)

export default router