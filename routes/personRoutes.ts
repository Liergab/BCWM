import express from 'express'
import * as controller from '../controllers/personController'

const personRouter = express.Router()

personRouter.post('/persons', controller.createPerson)
personRouter.get('/persons', controller.getAllPersons)
personRouter.get('/persons/:id', controller.getPerson)
personRouter.patch('/persons/:id', controller.updatePerson)
personRouter.delete('/persons/:id', controller.deletePerson)

export default personRouter
