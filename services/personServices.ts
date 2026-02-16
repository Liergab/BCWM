import PersonRepository, { PersonEntity } from '../repository/personRepository'
import {
  CreatePersonDTO,
  UpdatePersonDTO,
} from '../util/validation/personZod'

class PersonService {
  async createPerson(data: CreatePersonDTO): Promise<PersonEntity> {
    return (await PersonRepository.add(data)) as PersonEntity
  }

  async getAllPersons(): Promise<PersonEntity[]> {
    return await PersonRepository.docs()
  }

  async getPersonById(id: string): Promise<PersonEntity | null> {
    return await PersonRepository.doc(id)
  }

  async updatePerson(id: string, data: UpdatePersonDTO): Promise<PersonEntity | null> {
    return await PersonRepository.update(id, data)
  }

  async deletePerson(id: string): Promise<PersonEntity | null> {
    return await PersonRepository.delete(id)
  }
}

export default new PersonService()
