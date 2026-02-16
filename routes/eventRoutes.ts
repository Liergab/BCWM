import express from 'express'
import * as controller from '../controllers/eventController'
import { authMiddleware } from '../middleware/authMiddleware'

const eventRouter = express.Router()

eventRouter.post('/events', authMiddleware, controller.createEvent)
eventRouter.get('/events', authMiddleware, controller.getAllEvents)
eventRouter.get('/events/:id', authMiddleware, controller.getEvent)
eventRouter.patch('/events/:id', authMiddleware, controller.updateEvent)
eventRouter.delete('/events/:id', authMiddleware, controller.deleteEvent)

export default eventRouter
