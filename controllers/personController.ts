import { NextFunction, Request, Response } from 'express'
import PersonService from '../services/personServices'
import { PersonValidationSchemas } from '../util/validation/personZod'

export const createPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = PersonValidationSchemas.createPerson.parse(req.body)
    const created = await PersonService.createPerson(payload)
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
    const { id } = PersonValidationSchemas.idParam.parse({ id: req.params.id })
    const data = await PersonService.getPersonById(id)
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
    const { id } = PersonValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = PersonValidationSchemas.updatePerson.parse(req.body)
    const data = await PersonService.updatePerson(id, payload)
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
    const { id } = PersonValidationSchemas.idParam.parse({ id: req.params.id })
    const deleted = await PersonService.deletePerson(id)
    if (!deleted) {
      res.status(404).json({ message: 'Person not found' })
      return
    }
    res.status(200).json({ message: 'Person deleted' })
  } catch (error) {
    next(error)
  }
}
