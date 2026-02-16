import { GenericRepository } from './genericRepository'

export interface PersonEntity {
  id: string
  firstName: string
  lastName: string
  description?: string | null
  birthday?: Date | null
  age?: number | null
  phoneNumber?: string | null
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
