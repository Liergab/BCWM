import express from 'express'
import request from 'supertest'

jest.mock('../../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: '507f1f77bcf86cd799439011', email: 'me@example.com' }
    next()
  },
}))

jest.mock('../../controllers/userController', () => ({
  createUser: (_req: any, res: any) => res.status(201).json({ marker: 'createUser' }),
  logout: (_req: any, res: any) => res.status(200).json({ marker: 'logout' }),
  getAllUsers: (_req: any, res: any) => res.status(200).json({ marker: 'getAllUsers' }),
  searchUsers: (_req: any, res: any) => res.status(200).json({ marker: 'searchUsers' }),
  getCurrentUser: (_req: any, res: any) => res.status(200).json({ marker: 'getCurrentUser' }),
  updateCurrentUser: (_req: any, res: any) => res.status(200).json({ marker: 'updateCurrentUser' }),
  getUser: (_req: any, res: any) => res.status(200).json({ marker: 'getUser' }),
  updateUser: (_req: any, res: any) => res.status(200).json({ marker: 'updateUser' }),
  deleteUser: (_req: any, res: any) => res.status(200).json({ marker: 'deleteUser' }),
  login: (_req: any, res: any) => res.status(200).json({ marker: 'login' }),
  verifyEmail: (_req: any, res: any) => res.status(200).json({ marker: 'verifyEmail' }),
}))

import userRouter from '../../routes/userRoutes'

describe('User route mapping', () => {
  const app = express()
  app.use(express.json())
  app.use('/v1/api', userRouter)

  it('routes /users/me to getCurrentUser, not /users/:id', async () => {
    const response = await request(app).get('/v1/api/users/me').expect(200)
    expect(response.body.marker).toBe('getCurrentUser')
  })

  it('routes /users/:id to getUser for ObjectId-like values', async () => {
    const response = await request(app)
      .get('/v1/api/users/507f1f77bcf86cd799439011')
      .expect(200)
    expect(response.body.marker).toBe('getUser')
  })
})
