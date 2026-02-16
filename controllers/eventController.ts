import { NextFunction, Request, Response } from 'express'
import EventService from '../services/eventServices'
import { EventValidationSchemas } from '../util/validation/eventZod'

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = EventValidationSchemas.createEvent.parse(req.body)
    const created = await EventService.createEvent(payload)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = EventValidationSchemas.getQueriesParams.parse({
      select: req.query.select,
      selects: req.query.selects,
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter,
      sort: req.query.sort,
      queryArray: req.query.queryArray,
      queryArrayType: req.query.queryArrayType,
    })
    const { data, pagination } = await EventService.getAllEvents(query)
    res.status(200).json({ data, pagination })
  } catch (error) {
    next(error)
  }
}

export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = EventValidationSchemas.idParam.parse({ id: req.params.id })
    const query = EventValidationSchemas.getQueryParams.parse({
      select: req.query.select,
      selects: req.query.selects,
    })
    const data = await EventService.getEventById(id, query)
    if (!data) {
      res.status(404).json({ message: 'Event not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = EventValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = EventValidationSchemas.updateEvent.parse(req.body)
    const data = await EventService.updateEvent(id, payload)
    if (!data) {
      res.status(404).json({ message: 'Event not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = EventValidationSchemas.idParam.parse({ id: req.params.id })
    const deleted = await EventService.deleteEvent(id)
    if (!deleted) {
      res.status(404).json({ message: 'Event not found' })
      return
    }
    res.status(200).json({ message: 'Event deleted' })
  } catch (error) {
    next(error)
  }
}
