import express from 'express';
import * as controller from '../controllers/userController';

const userRouter = express.Router();

// User routes - direct endpoints
userRouter.post('/users', controller.createUser);
userRouter.get('/users', controller.getAllUsers);
userRouter.get('/users/search', controller.searchUsers);
userRouter.get('/users/:id', controller.getUser);
userRouter.put('/users/:id', controller.updateUser);
userRouter.delete('/users/:id', controller.deleteUser);
userRouter.post('/users/login', controller.login);

export default userRouter;
