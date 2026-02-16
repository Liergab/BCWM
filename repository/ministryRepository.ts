import { GenericRepository } from './genericRepository'

export interface MinistryEntity {
  id: string
  name: string
  description?: string | null
  isActive?: boolean
  leaderUserId?: string | null
  scheduleDay?: string | null
  scheduleTime?: string | null
}

class MinistryRepository extends GenericRepository<MinistryEntity> {
  constructor() {
    super('ministry')
  }
}

export default new MinistryRepository()
