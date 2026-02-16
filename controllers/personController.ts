import { NextFunction, Request, Response } from 'express'
import PersonService from '../services/personServices'

export const createPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const created = await PersonService.createPerson(req.body)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllPersons = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await PersonService.getAllPersons()
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const getPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await PersonService.getPersonById(req.params.id)
    if (!data) {
      res.status(404).json({ message: 'Person not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updatePerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await PersonService.updatePerson(req.params.id, req.body)
    if (!data) {
      res.status(404).json({ message: 'Person not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const deletePerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await PersonService.deletePerson(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: 'Person not found' })
      return
    }
    res.status(200).json({ message: 'Person deleted' })
  } catch (error) {
    next(error)
  }
}
