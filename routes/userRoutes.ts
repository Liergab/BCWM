import express from 'express';
import * as controller from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const userRouter = express.Router();

// User routes - direct endpoints
userRouter.post('/users', controller.createUser);
userRouter.post('/users/logout', controller.logout);
userRouter.get('/users', authMiddleware, controller.getAllUsers);
userRouter.get('/users/search', authMiddleware, controller.searchUsers);
userRouter.get('/users/me', authMiddleware, controller.getCurrentUser);
userRouter.put('/users/me', authMiddleware, controller.updateCurrentUser);
userRouter.get('/users/:id', authMiddleware, controller.getUser);
userRouter.put('/users/:id', authMiddleware, controller.updateUser);
userRouter.delete('/users/:id', authMiddleware, controller.deleteUser);
userRouter.post('/users/login', controller.login);
userRouter.post('/users/verify', controller.verifyEmail);

export default userRouter;
