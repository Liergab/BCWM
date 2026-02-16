import MinistryRepository, { MinistryEntity } from '../repository/ministryRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreateMinistryDTO,
  GetMinistryQueryDTO,
  GetMinistriesQueryDTO,
  UpdateMinistryDTO,
} from '../util/validation/ministryZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class MinistryService {
  async createMinistry(data: CreateMinistryDTO): Promise<MinistryEntity> {
    return (await MinistryRepository.add(data)) as MinistryEntity
  }

  async getAllMinistries(
    query: GetMinistriesQueryDTO = {}
  ): Promise<{ data: MinistryEntity[]; pagination: PaginationMeta }> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    const { where, orderBy } = applyListQueryParams({}, query)
    dbParams.where = where
    if (orderBy != null) dbParams.orderBy = orderBy
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    dbParams.skip = (page - 1) * limit
    dbParams.take = limit
    const [data, total] = await Promise.all([
      MinistryRepository.docs(dbParams),
      MinistryRepository.count(dbParams.where),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getMinistryById(id: string, query: GetMinistryQueryDTO = {}): Promise<MinistryEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await MinistryRepository.doc(id, dbParams)
  }

  async updateMinistry(id: string, data: UpdateMinistryDTO): Promise<MinistryEntity | null> {
    return await MinistryRepository.update(id, data)
  }

  async deleteMinistry(id: string): Promise<MinistryEntity | null> {
    return await MinistryRepository.delete(id)
  }
}

export default new MinistryService()
