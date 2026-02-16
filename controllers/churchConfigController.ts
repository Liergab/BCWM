import { NextFunction, Request, Response } from 'express'
import ChurchConfigService from '../services/churchConfigServices'
import { ChurchConfigValidationSchemas } from '../util/validation/churchConfigZod'

export const createChurchConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = ChurchConfigValidationSchemas.createChurchConfig.parse(req.body)
    const created = await ChurchConfigService.createChurchConfig(payload)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllChurchConfigs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = ChurchConfigValidationSchemas.getQueriesParams.parse({
      select: req.query.select,
      selects: req.query.selects,
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter,
      sort: req.query.sort,
      queryArray: req.query.queryArray,
      queryArrayType: req.query.queryArrayType,
    })
    const { data, pagination } = await ChurchConfigService.getAllChurchConfigs(query)
    res.status(200).json({ data, pagination })
  } catch (error) {
    next(error)
  }
}

export const getChurchConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = ChurchConfigValidationSchemas.idParam.parse({ id: req.params.id })
    const query = ChurchConfigValidationSchemas.getQueryParams.parse({
      select: req.query.select,
      selects: req.query.selects,
    })
    const data = await ChurchConfigService.getChurchConfigById(id, query)
    if (!data) {
      res.status(404).json({ message: 'ChurchConfig not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updateChurchConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = ChurchConfigValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = ChurchConfigValidationSchemas.updateChurchConfig.parse(req.body)
    const data = await ChurchConfigService.updateChurchConfig(id, payload)
    if (!data) {
      res.status(404).json({ message: 'ChurchConfig not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const deleteChurchConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = ChurchConfigValidationSchemas.idParam.parse({ id: req.params.id })
    const deleted = await ChurchConfigService.deleteChurchConfig(id)
    if (!deleted) {
      res.status(404).json({ message: 'ChurchConfig not found' })
      return
    }
    res.status(200).json({ message: 'ChurchConfig deleted' })
  } catch (error) {
    next(error)
  }
}
