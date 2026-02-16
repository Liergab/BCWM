import EventRepository, { EventEntity } from '../repository/eventRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreateEventDTO,
  GetEventQueryDTO,
  GetEventsQueryDTO,
  UpdateEventDTO,
} from '../util/validation/eventZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class EventService {
  async createEvent(data: CreateEventDTO): Promise<EventEntity> {
    return (await EventRepository.add(data)) as EventEntity
  }

  async getAllEvents(
    query: GetEventsQueryDTO = {}
  ): Promise<{ data: EventEntity[]; pagination: PaginationMeta }> {
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
      EventRepository.docs(dbParams),
      EventRepository.count(dbParams.where),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getEventById(id: string, query: GetEventQueryDTO = {}): Promise<EventEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await EventRepository.doc(id, dbParams)
  }

  async updateEvent(id: string, data: UpdateEventDTO): Promise<EventEntity | null> {
    return await EventRepository.update(id, data)
  }

  async deleteEvent(id: string): Promise<EventEntity | null> {
    return await EventRepository.delete(id)
  }
}

export default new EventService()
