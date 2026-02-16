import express from 'express'
import * as controller from '../controllers/memberController'
import { authMiddleware } from '../middleware/authMiddleware'

const memberRouter = express.Router()

memberRouter.post('/members', authMiddleware, controller.createMember)
memberRouter.get('/members', authMiddleware, controller.getAllMembers)
memberRouter.get('/members/:id', authMiddleware, controller.getMember)
memberRouter.patch('/members/:id', authMiddleware, controller.updateMember)
memberRouter.delete('/members/:id', authMiddleware, controller.deleteMember)

export default memberRouter
