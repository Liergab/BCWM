import express from 'express'
import * as controller from '../controllers/churchConfigController'
import { authMiddleware } from '../middleware/authMiddleware'
import { authorizeRoles } from '../middleware/roleMiddleware'

const churchConfigRouter = express.Router()

churchConfigRouter.post('/churchConfigs', authMiddleware, authorizeRoles('SUPER_ADMIN'), controller.createChurchConfig)
churchConfigRouter.get('/churchConfigs', authMiddleware, controller.getAllChurchConfigs)
churchConfigRouter.get('/churchConfigs/:id', authMiddleware, controller.getChurchConfig)
churchConfigRouter.patch('/churchConfigs/:id', authMiddleware, authorizeRoles('SUPER_ADMIN'), controller.updateChurchConfig)
churchConfigRouter.delete('/churchConfigs/:id', authMiddleware, authorizeRoles('SUPER_ADMIN'), controller.deleteChurchConfig)

export default churchConfigRouter
