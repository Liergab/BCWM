import { GenericRepository } from './genericRepository'

export interface ChurchConfigEntity {
  id: string
  churchName: string
  shortName?: string | null
  logoUrl?: string | null
  denomination?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  address?: {
    street?: string | null
    barangay?: string | null
    city?: string | null
    municipality?: string | null
    province?: string | null
    postalCode?: string | null
  } | null
  defaultTheme?: {
    primaryColor?: string | null
    secondaryColor?: string | null
    accentColor?: string | null
    darkMode?: boolean | null
  } | null
  serviceSchedules?: Array<{
    dayOfWeek: string
    serviceName: string
    serviceTime: string
    isRecurring: boolean
    locationLabel?: string | null
  }>
}

class ChurchConfigRepository extends GenericRepository<ChurchConfigEntity> {
  constructor() {
    super('churchConfig')
  }
}

export default new ChurchConfigRepository()
