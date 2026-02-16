import express from 'express'
import * as controller from '../controllers/ministryController'
import { authMiddleware } from '../middleware/authMiddleware'

const ministryRouter = express.Router()

ministryRouter.post('/ministries', authMiddleware, controller.createMinistry)
ministryRouter.get('/ministries', authMiddleware, controller.getAllMinistries)
ministryRouter.get('/ministries/:id', authMiddleware, controller.getMinistry)
ministryRouter.patch('/ministries/:id', authMiddleware, controller.updateMinistry)
ministryRouter.delete('/ministries/:id', authMiddleware, controller.deleteMinistry)

export default ministryRouter
