import { NextFunction, Request, Response } from 'express'
import MinistryService from '../services/ministryServices'
import { MinistryValidationSchemas } from '../util/validation/ministryZod'

export const createMinistry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = MinistryValidationSchemas.createMinistry.parse(req.body)
    const created = await MinistryService.createMinistry(payload)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllMinistries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = MinistryValidationSchemas.getQueriesParams.parse({
      select: req.query.select,
      selects: req.query.selects,
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter,
      sort: req.query.sort,
      queryArray: req.query.queryArray,
      queryArrayType: req.query.queryArrayType,
    })
    const { data, pagination } = await MinistryService.getAllMinistries(query)
    res.status(200).json({ data, pagination })
  } catch (error) {
    next(error)
  }
}

export const getMinistry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MinistryValidationSchemas.idParam.parse({ id: req.params.id })
    const query = MinistryValidationSchemas.getQueryParams.parse({
      select: req.query.select,
      selects: req.query.selects,
    })
    const data = await MinistryService.getMinistryById(id, query)
    if (!data) {
      res.status(404).json({ message: 'Ministry not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updateMinistry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MinistryValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = MinistryValidationSchemas.updateMinistry.parse(req.body)
    const data = await MinistryService.updateMinistry(id, payload)
    if (!data) {
      res.status(404).json({ message: 'Ministry not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const deleteMinistry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MinistryValidationSchemas.idParam.parse({ id: req.params.id })
    const deleted = await MinistryService.deleteMinistry(id)
    if (!deleted) {
      res.status(404).json({ message: 'Ministry not found' })
      return
    }
    res.status(200).json({ message: 'Ministry deleted' })
  } catch (error) {
    next(error)
  }
}
