import { comparePassword, hashPassword } from '../config/bcrypt';
import { sendVerificationEmail, sendWelcomeEmail } from '../config/emails';
import UserRepository from '../repository/userRepository';
import { IUser } from '../types/index';
import { buildNestedSelect, parseSelectFields } from '../util/buildNestedSelect';
import { buildPagination } from '../util/buildPagination';
import generateToken from '../util/generateToken';
import { applyListQueryParams } from '../util/applyListQueryParams';
import env from '../util/validate';
import {
  CreateUserDTO,
  GetUserQueryDTO,
  GetUsersQueryDTO,
  LoginDTO,
  UpdateUserDTO,
  VerifyEmailDTO,
} from '../util/validation/userZod';

// Full person fields for "select=person" (bare relation name)
const PERSON_SELECT_ALL: Record<string, boolean> = {
  id: true,
  firstName: true,
  lastName: true,
  description: true,
  birthday: true,
  age: true,
  phoneNumber: true,
  address: true,
  createdAt: true,
  updatedAt: true,
};

class UserService {
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private splitFullName(name?: string): { firstName: string; lastName: string } {
    const normalized = (name || '').trim();
    if (!normalized) {
      return { firstName: 'Member', lastName: 'BCWM' };
    }

    const [firstName, ...lastNameParts] = normalized.split(/\s+/);
    return {
      firstName,
      lastName: lastNameParts.join(' ') || 'BCWM',
    };
  }

  // Create a new user
  async createUser(
    userData: CreateUserDTO
  ): Promise<{ token: string | null; user: Omit<IUser, 'password'>; message: string }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (userExists) {
      throw new Error('User already exists');
    }
    const verificationCode = this.generateVerificationCode();
    const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const hashedPassword = await hashPassword(userData.password!);
    const { person, name, address, ...accountData } = userData;
    const splitName = this.splitFullName(name);
    const personPayload = person || {
      firstName: splitName.firstName,
      lastName: splitName.lastName,
      address,
    };
    const newUser = await UserRepository.add({
      ...accountData,
      password: hashedPassword,
      verificationToken: verificationCode,
      verificationTokenExpiresAt,
      isVerified: false,
      person: {
        create: personPayload,
      },
    } as any);
    await sendVerificationEmail(newUser.email, verificationCode);
    const userWithPerson = await UserRepository.getWithPersonById(newUser.id);
    const { password: _, ...userWithoutPassword } = (userWithPerson || newUser) as any; // Prisma returns plain objects
    return {
      user: userWithoutPassword,
      token: null,
      message:
        'Registration successful. Please verify your email with the 4-digit code sent to you.',
    };
  }

  async login(userData: LoginDTO): Promise<{ token: string; user: Omit<IUser, 'password'> }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (!userExists) {
      throw new Error('User does not exist');
    }
    const isValidPassword = await comparePassword(userData.password!, userExists.password!);
    if (!isValidPassword) {
      throw new Error('Invalid Password');
    }
    const userStatus = (userExists as any).status;
    if (userStatus === 'INACTIVE' || userStatus === 'inactive') {
      throw new Error(`Account is inactive. Please contact BCWM email: ${env.EMAIL_TEST}`);
    }
    if (!userExists.isVerified) {
      const verificationCode = this.generateVerificationCode();
      const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await UserRepository.update(userExists.id, {
        verificationToken: verificationCode,
        verificationTokenExpiresAt,
      } as any);
      await sendVerificationEmail(userExists.email, verificationCode);

      throw new Error(
        'Account is not verified. We sent a new verification code to your email. Please use it to verify your account.'
      );
    }
    await UserRepository.update(userExists.id, {
      status: 'ACTIVE',
      lastLogin: new Date(),
    } as any);
    const latestUser = await UserRepository.getWithPersonById(userExists.id);
    const token = await generateToken(userExists.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = (latestUser || userExists) as any; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
  }

  async verifyEmail(
    verificationData: VerifyEmailDTO
  ): Promise<{ token: string; user: Omit<IUser, 'password'>; message: string }> {
    const user = await UserRepository.getEmail(verificationData.email);
    if (!user) {
      throw new Error('User does not exist');
    }
    if (user.isVerified) {
      throw new Error('Account already verified');
    }
    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
      throw new Error('Verification code is not available');
    }
    if (new Date(user.verificationTokenExpiresAt).getTime() < Date.now()) {
      throw new Error('Verification code expired');
    }
    if (user.verificationToken !== verificationData.verificationCode) {
      throw new Error('Invalid verification code');
    }

    await UserRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    } as any);

    const verifiedUser = await UserRepository.getWithPersonById(user.id);
    const token = await generateToken(user.id);
    const { password: _, ...userWithoutPassword } = (verifiedUser || user) as any;
    await sendWelcomeEmail(user.email, 'User');

    return {
      user: userWithoutPassword,
      token,
      message: 'Email verified successfully.',
    };
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.getWithPersonById(id);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve user');
    }
  }

  async getUsers(params: GetUsersQueryDTO): Promise<{ users: IUser[]; pagination: any }> {
    if (!params) {
      throw new Error('Invalid parameters for getting all users');
    }

    try {
      const dbParams: any = { where: {} };

      const selectFields = parseSelectFields(params.select, params.selects);
      const hasSelect = selectFields.length > 0;

      // Handle include for relations — only when not using field selection
      // (Prisma: select and include cannot be used together)
      if (hasSelect) {
        dbParams.select = buildNestedSelect(selectFields, { person: PERSON_SELECT_ALL }) as Record<string, boolean | object>;
      } else if (params.include && typeof params.include === 'object') {
        dbParams.include = params.include;
      } else {
        dbParams.include = { person: true };
      }

      const { where, orderBy } = applyListQueryParams(dbParams.where, {
        filter: params.filter,
        sort: params.sort,
        queryArray: params.queryArray,
        queryArrayType: params.queryArrayType,
      });
      dbParams.where = where;
      if (orderBy != null) dbParams.orderBy = orderBy;

      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      dbParams.skip = (page - 1) * limit;
      dbParams.take = limit;

      const [users, total] = await Promise.all([
        UserRepository.docs(dbParams),
        UserRepository.count(dbParams.where),
      ]);

      return { users, pagination: buildPagination(total, page, limit) };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }

  // Update user details by ID
  async updateUser(id: string, userData: UpdateUserDTO): Promise<IUser | null> {
    try {
      const { person, ...accountData } = userData;
      const updateData: any = { ...accountData };

      if (accountData.password) {
        updateData.password = await hashPassword(accountData.password);
      }

      if (person && Object.keys(person).length > 0) {
        updateData.person = {
          upsert: {
            create: person,
            update: person,
          },
        };
      }

      await UserRepository.update(id, updateData);
      return await UserRepository.getWithPersonById(id);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update user');
    }
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete user');
    }
  }

  // Search users with specific criteria
  async searchUsers(search: string): Promise<IUser[]> {
    try {
      return await UserRepository.searchByEmailOrPersonName(search);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search users');
    }
  }

  async getUser(id: string, params: GetUserQueryDTO): Promise<IUser | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    try {
      const dbParams: any = {};

      // Handle field selection (supports dot notation e.g. person.firstName)
      const selectFields = parseSelectFields(params.select, undefined);
      if (selectFields.length > 0) {
        dbParams.select = buildNestedSelect(selectFields, { person: PERSON_SELECT_ALL }) as Record<string, boolean | object>;
      }

      if (!dbParams.select) {
        dbParams.include = { person: true };
      }

      return await UserRepository.doc(id, dbParams);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }
}

export default new UserService();
