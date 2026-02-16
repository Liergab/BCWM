import { GenericRepository } from './genericRepository'

export interface EventEntity {
  id: string
  title: string
  description?: string | null
  ministryId?: string | null
  eventDate: Date
  location?: string | null
  attendeeLimit?: number | null
  attendanceCount?: number
  isPublished?: boolean
  createdByUserId?: string | null
}

class EventRepository extends GenericRepository<EventEntity> {
  constructor() {
    super('event')
  }
}

export default new EventRepository()
