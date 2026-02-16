import { NextFunction, Request, Response } from 'express'
import MemberService from '../services/memberServices'
import { MemberValidationSchemas } from '../util/validation/memberZod'

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = MemberValidationSchemas.createMember.parse(req.body)
    const created = await MemberService.createMember(payload)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = MemberValidationSchemas.getQueriesParams.parse({
      select: req.query.select,
      selects: req.query.selects,
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter,
      sort: req.query.sort,
      queryArray: req.query.queryArray,
      queryArrayType: req.query.queryArrayType,
    })
    const { data, pagination } = await MemberService.getAllMembers(query)
    res.status(200).json({ data, pagination })
  } catch (error) {
    next(error)
  }
}

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MemberValidationSchemas.idParam.parse({ id: req.params.id })
    const query = MemberValidationSchemas.getQueryParams.parse({
      select: req.query.select,
      selects: req.query.selects,
    })
    const data = await MemberService.getMemberById(id, query)
    if (!data) {
      res.status(404).json({ message: 'Member not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MemberValidationSchemas.idParam.parse({ id: req.params.id })
    const payload = MemberValidationSchemas.updateMember.parse(req.body)
    const data = await MemberService.updateMember(id, payload)
    if (!data) {
      res.status(404).json({ message: 'Member not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const deleteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = MemberValidationSchemas.idParam.parse({ id: req.params.id })
    const deleted = await MemberService.deleteMember(id)
    if (!deleted) {
      res.status(404).json({ message: 'Member not found' })
      return
    }
    res.status(200).json({ message: 'Member deleted' })
  } catch (error) {
    next(error)
  }
}
