import { GenericRepository } from './genericRepository'

export interface MemberEntity {
  id: string
  memberCode: string
  personId: string
  userId?: string | null
  ministryId?: string | null
  familyGroupCode?: string | null
  membershipStatus?: "ACTIVE" | "INACTIVE" | "VISITOR"
  membershipDate?: Date
  baptismDate?: Date | null
  attendanceCount?: number
  volunteerCount?: number
  notes?: string | null
}

class MemberRepository extends GenericRepository<MemberEntity> {
  constructor() {
    super('member')
  }
}

export default new MemberRepository()
