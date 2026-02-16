import ChurchConfigRepository, { ChurchConfigEntity } from '../repository/churchConfigRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreateChurchConfigDTO,
  GetChurchConfigQueryDTO,
  GetChurchConfigsQueryDTO,
  UpdateChurchConfigDTO,
} from '../util/validation/churchConfigZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class ChurchConfigService {
  async createChurchConfig(data: CreateChurchConfigDTO): Promise<ChurchConfigEntity> {
    return (await ChurchConfigRepository.add(data)) as ChurchConfigEntity
  }

  async getAllChurchConfigs(
    query: GetChurchConfigsQueryDTO = {}
  ): Promise<{ data: ChurchConfigEntity[]; pagination: PaginationMeta }> {
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
      ChurchConfigRepository.docs(dbParams),
      ChurchConfigRepository.count(dbParams.where),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getChurchConfigById(id: string, query: GetChurchConfigQueryDTO = {}): Promise<ChurchConfigEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await ChurchConfigRepository.doc(id, dbParams)
  }

  async updateChurchConfig(id: string, data: UpdateChurchConfigDTO): Promise<ChurchConfigEntity | null> {
    return await ChurchConfigRepository.update(id, data)
  }

  async deleteChurchConfig(id: string): Promise<ChurchConfigEntity | null> {
    return await ChurchConfigRepository.delete(id)
  }
}

export default new ChurchConfigService()
