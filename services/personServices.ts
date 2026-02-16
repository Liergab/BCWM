import PersonRepository, { PersonEntity } from '../repository/personRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreatePersonDTO,
  GetPersonQueryDTO,
  GetPersonsQueryDTO,
  UpdatePersonDTO,
} from '../util/validation/personZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class PersonService {
  async createPerson(data: CreatePersonDTO): Promise<PersonEntity> {
    return (await PersonRepository.add(data)) as PersonEntity
  }

  async getAllPersons(
    query: GetPersonsQueryDTO = {}
  ): Promise<{ data: PersonEntity[]; pagination: PaginationMeta }> {
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
      PersonRepository.docs(dbParams),
      PersonRepository.count(dbParams.where),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getPersonById(id: string, query: GetPersonQueryDTO = {}): Promise<PersonEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await PersonRepository.doc(id, dbParams)
  }

  async updatePerson(id: string, data: UpdatePersonDTO): Promise<PersonEntity | null> {
    return await PersonRepository.update(id, data)
  }

  async deletePerson(id: string): Promise<PersonEntity | null> {
    return await PersonRepository.delete(id)
  }
}

export default new PersonService()
