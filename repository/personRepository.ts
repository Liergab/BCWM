import { GenericRepository } from './genericRepository'

export interface PersonEntity {
  id: string
  name: string
  description?: string | null
  address?: {
    street?: string | null
    barangay?: string | null
    city?: string | null
    municipality?: string | null
    province?: string | null
    postalCode?: string | null
  } | null
}

class PersonRepository extends GenericRepository<PersonEntity> {
  constructor() {
    super('person')
  }
}

export default new PersonRepository()
