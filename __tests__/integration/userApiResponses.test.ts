import express from 'express'
import request from 'supertest'
import userRouter from '../../routes/userRoutes'
import { errorValidation } from '../../middleware/error'
import UserService from '../../services/userServices'

jest.mock('../../services/userServices', () => ({
  __esModule: true,
  default: {
    createUser: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    searchUsers: jest.fn(),
  },
}))

jest.mock('../../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    if (req.headers['x-test-auth'] === 'off') {
      res.status(401).json({ message: 'Not Authorized, No token' })
      return
    }
    req.user = { id: '507f1f77bcf86cd799439011', email: 'me@example.com' }
    next()
  },
}))

const userServiceMock = UserService as unknown as {
  createUser: jest.Mock
  login: jest.Mock
  verifyEmail: jest.Mock
  getUsers: jest.Mock
  getUser: jest.Mock
  updateUser: jest.Mock
  deleteUser: jest.Mock
  searchUsers: jest.Mock
}

describe('User API response contracts', () => {
  const app = express()
  app.use(express.json())
  app.use('/v1/api', userRouter)
  app.use(errorValidation)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /users returns success payload', async () => {
    userServiceMock.createUser.mockResolvedValueOnce({
      user: { id: '507f1f77bcf86cd799439011', email: 'juan@example.com' },
      token: null,
      message: 'Registration successful',
    })

    const response = await request(app).post('/v1/api/users').send({
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      password: 'Password123',
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('user')
  })

  it('POST /users returns conflict message when user exists', async () => {
    userServiceMock.createUser.mockRejectedValueOnce(new Error('User already exists'))

    const response = await request(app).post('/v1/api/users').send({
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      password: 'Password123',
    })

    expect(response.status).toBe(409)
    expect(response.body.message).toContain('User already exists')
  })

  it('POST /users/login returns success payload', async () => {
    userServiceMock.login.mockResolvedValueOnce({
      user: { id: '507f1f77bcf86cd799439011', email: 'juan@example.com' },
      token: 'token-value',
    })

    const response = await request(app).post('/v1/api/users/login').send({
      email: 'juan@example.com',
      password: 'Password123',
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user.email).toBe('juan@example.com')
  })

  it('POST /users/login returns unauthorized on invalid password', async () => {
    userServiceMock.login.mockRejectedValueOnce(new Error('Invalid Password'))

    const response = await request(app).post('/v1/api/users/login').send({
      email: 'juan@example.com',
      password: 'wrong-password',
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toContain('Invalid Password')
  })

  it('POST /users/login returns forbidden for unverified account', async () => {
    userServiceMock.login.mockRejectedValueOnce(
      new Error('Account is not verified. We sent a new verification code to your email.')
    )

    const response = await request(app).post('/v1/api/users/login').send({
      email: 'juan@example.com',
      password: 'Password123',
    })

    expect(response.status).toBe(403)
    expect(response.body.message).toContain('Account is not verified')
  })

  it('POST /users/verify returns success payload', async () => {
    userServiceMock.verifyEmail.mockResolvedValueOnce({
      user: { id: '507f1f77bcf86cd799439011', email: 'juan@example.com' },
      token: 'verified-token',
      message: 'Email verified successfully.',
    })

    const response = await request(app).post('/v1/api/users/verify').send({
      email: 'juan@example.com',
      verificationCode: '1234',
    })

    expect(response.status).toBe(200)
    expect(response.body.message).toContain('verified')
    expect(response.body).toHaveProperty('token')
  })

  it('POST /users/verify returns validation error for wrong code', async () => {
    userServiceMock.verifyEmail.mockRejectedValueOnce(new Error('Invalid verification code'))

    const response = await request(app).post('/v1/api/users/verify').send({
      email: 'juan@example.com',
      verificationCode: '1234',
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Invalid verification code')
  })

  it('GET /users requires authentication', async () => {
    const response = await request(app).get('/v1/api/users').set('x-test-auth', 'off')
    expect(response.status).toBe(401)
    expect(response.body.message).toContain('Not Authorized')
  })

  it('GET /users returns success wrapper', async () => {
    userServiceMock.getUsers.mockResolvedValueOnce({ users: [], pagination: {} })

    const response = await request(app).get('/v1/api/users')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Users retrieved successfully')
    expect(response.body).toHaveProperty('data')
  })

  it('GET /users/search returns data list', async () => {
    userServiceMock.searchUsers.mockResolvedValueOnce([{ id: '507f1f77bcf86cd799439011' }])

    const response = await request(app).get('/v1/api/users/search?search=juan')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  it('GET /users/me returns current user payload', async () => {
    const response = await request(app).get('/v1/api/users/me')
    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe('507f1f77bcf86cd799439011')
  })

  it('GET /users/:id returns wrapped success payload', async () => {
    userServiceMock.getUser.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439011',
      email: 'juan@example.com',
    })

    const response = await request(app).get('/v1/api/users/507f1f77bcf86cd799439011')
    expect(response.status).toBe(200)
    expect(response.body.message).toContain('retrieved successfully')
    expect(response.body.data.email).toBe('juan@example.com')
  })

  it('PUT /users/me returns updated user payload', async () => {
    userServiceMock.updateUser.mockResolvedValueOnce({
      id: '507f1f77bcf86cd799439011',
      email: 'updated@example.com',
    })

    const response = await request(app).put('/v1/api/users/me').send({
      email: 'updated@example.com',
    })

    expect(response.status).toBe(200)
    expect(response.body.email).toBe('updated@example.com')
  })

  it('DELETE /users/:id returns success message', async () => {
    userServiceMock.deleteUser.mockResolvedValueOnce({ id: '507f1f77bcf86cd799439011' })

    const response = await request(app).delete('/v1/api/users/507f1f77bcf86cd799439011')
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('User deleted')
  })
})
