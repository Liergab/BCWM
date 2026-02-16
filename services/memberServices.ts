import MemberRepository, { MemberEntity } from '../repository/memberRepository'
import { applyListQueryParams } from '../util/applyListQueryParams'
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect'
import {
  CreateMemberDTO,
  GetMemberQueryDTO,
  GetMembersQueryDTO,
  UpdateMemberDTO,
} from '../util/validation/memberZod'
import { buildPagination, type PaginationMeta } from '../util/buildPagination'

class MemberService {
  async createMember(data: CreateMemberDTO): Promise<MemberEntity> {
    return (await MemberRepository.add(data)) as MemberEntity
  }

  async getAllMembers(
    query: GetMembersQueryDTO = {}
  ): Promise<{ data: MemberEntity[]; pagination: PaginationMeta }> {
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
      MemberRepository.docs(dbParams),
      MemberRepository.count(dbParams.where),
    ])
    return { data, pagination: buildPagination(total, page, limit) }
  }

  async getMemberById(id: string, query: GetMemberQueryDTO = {}): Promise<MemberEntity | null> {
    const selectFields = parseSelectFields(query.select, query.selects)
    const dbParams: any = {}
    if (selectFields.length > 0) {
      dbParams.select = buildNestedSelect(selectFields) as Record<string, boolean | object>
    }
    return await MemberRepository.doc(id, dbParams)
  }

  async updateMember(id: string, data: UpdateMemberDTO): Promise<MemberEntity | null> {
    return await MemberRepository.update(id, data)
  }

  async deleteMember(id: string): Promise<MemberEntity | null> {
    return await MemberRepository.delete(id)
  }
}

export default new MemberService()
