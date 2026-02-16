import express from 'express'
import request from 'supertest'
import personRouter from '../../routes/personRoutes'
import { errorValidation } from '../../middleware/error'
import PersonService from '../../services/personServices'

jest.mock('../../services/personServices', () => ({
  __esModule: true,
  default: {
    createPerson: jest.fn(),
    getAllPersons: jest.fn(),
    getPersonById: jest.fn(),
    updatePerson: jest.fn(),
    deletePerson: jest.fn(),
  },
}))

const personServiceMock = PersonService as unknown as {
  createPerson: jest.Mock
  getAllPersons: jest.Mock
  getPersonById: jest.Mock
  updatePerson: jest.Mock
  deletePerson: jest.Mock
}

describe('Person API response contracts', () => {
  const app = express()
  app.use(express.json())
  app.use('/v1/api', personRouter)
  app.use(errorValidation)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validPayload = {
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    birthday: '1998-01-01T00:00:00.000Z',
    age: 28,
    phoneNumber: '09171234567',
    address: {
      city: 'Unisan',
    },
  }

  it('POST /persons returns success data wrapper', async () => {
    personServiceMock.createPerson.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439011',
      ...validPayload,
    })

    const response = await request(app).post('/v1/api/persons').send(validPayload)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data.firstName).toBe('Juan')
  })

  it('POST /persons returns validation error for missing names', async () => {
    const response = await request(app).post('/v1/api/persons').send({ age: 22 })
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Request validation failed')
  })

  it('GET /persons returns data list wrapper', async () => {
    personServiceMock.getAllPersons.mockResolvedValueOnce({
      data: [{ id: '507f1f77bcf86cd799439011', firstName: 'Juan', lastName: 'Dela Cruz' }],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    })

    const response = await request(app).get('/v1/api/persons')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  it('GET /persons/:id returns person not found message', async () => {
    personServiceMock.getPersonById.mockResolvedValueOnce(null)

    const response = await request(app).get('/v1/api/persons/507f1f77bcf86cd799439011')
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Person not found')
  })

  it('PATCH /persons/:id returns updated data', async () => {
    personServiceMock.updatePerson.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439011',
      firstName: 'Updated',
      lastName: 'Name',
    })

    const response = await request(app)
      .patch('/v1/api/persons/507f1f77bcf86cd799439011')
      .send({ firstName: 'Updated' })
    expect(response.status).toBe(200)
    expect(response.body.data.firstName).toBe('Updated')
  })

  it('DELETE /persons/:id returns success message', async () => {
    personServiceMock.deletePerson.mockResolvedValueOnce({ id: '507f1f77bcf86cd799439011' })

    const response = await request(app).delete('/v1/api/persons/507f1f77bcf86cd799439011')
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Person deleted')
  })
})
