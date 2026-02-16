import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../util/validate';
import UserRepository from '../repository/userRepository';
import { IUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, 'password'> | null;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies['auth-token'];

    if (token) {
      try {
        const decode = jwt.verify(token, env.SECRET_KEY) as JwtPayload & { id: string };

        // Use Prisma repository to find user
        const user = await UserRepository.doc(decode.id);

        if (!user) {
          res.status(401).json({ message: 'User not found' });
          return;
        }

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        next();
      } catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ message: 'Not Authorized, Invalid Token' });
      }
    } else {
      res.status(401).json({ message: 'Not Authorized, No token' });
    }
  } catch (error) {
    next(error);
  }
};
