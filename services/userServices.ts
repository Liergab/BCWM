import { comparePassword, hashPassword } from "../config/bcrypt";
import { sendVerificationEmail, sendWelcomeEmail } from "../config/emails";
import UserRepository from "../repository/userRepository";
import { IUser } from "../types/index";
import generateToken from "../util/generateToken";
import parseFilterString from "../util/parseFilterString";
import env from "../util/validate";
import {
  CreateUserDTO,
  GetUserQueryDTO,
  GetUsersQueryDTO,
  LoginDTO,
  UpdateUserDTO,
  VerifyEmailDTO,
} from "../util/validation/userZod";

class UserService {
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private splitFullName(name?: string): { firstName: string; lastName: string } {
    const normalized = (name || "").trim();
    if (!normalized) {
      return { firstName: "Member", lastName: "BCWM" };
    }

    const [firstName, ...lastNameParts] = normalized.split(/\s+/);
    return {
      firstName,
      lastName: lastNameParts.join(" ") || "BCWM",
    };
  }

  // Create a new user
  async createUser(
    userData: CreateUserDTO
  ): Promise<{ token: string | null; user: Omit<IUser, 'password'>; message: string }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (userExists) {
      throw new Error("User already exists");
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
      message: "Registration successful. Please verify your email with the 4-digit code sent to you.",
    };
  }

  async login(
    userData: LoginDTO
  ): Promise<{ token: string; user: Omit<IUser, 'password'> }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (!userExists) {
      throw new Error("User does not exist");
    }
    const isValidPassword = await comparePassword(
      userData.password!,
      userExists.password!
    );
    if (!isValidPassword) {
      throw new Error("Invalid Password");
    }
    const userStatus = (userExists as any).status;
    if (userStatus === "INACTIVE" || userStatus === "inactive") {
      throw new Error(
        `Account is inactive. Please contact BCWM email: ${env.EMAIL_TEST}`
      );
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
        "Account is not verified. We sent a new verification code to your email. Please use it to verify your account."
      );
    }
    await UserRepository.update(userExists.id, {
      status: "ACTIVE",
      lastLogin: new Date(),
    } as any);
    const latestUser = await UserRepository.getWithPersonById(userExists.id);
    const token = await generateToken(userExists.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = (latestUser || userExists) as any; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
  }

  async verifyEmail(
    verificationData: VerifyEmailDTO
  ): Promise<{ token: string; user: Omit<IUser, "password">; message: string }> {
    const user = await UserRepository.getEmail(verificationData.email);
    if (!user) {
      throw new Error("User does not exist");
    }
    if (user.isVerified) {
      throw new Error("Account already verified");
    }
    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
      throw new Error("Verification code is not available");
    }
    if (new Date(user.verificationTokenExpiresAt).getTime() < Date.now()) {
      throw new Error("Verification code expired");
    }
    if (user.verificationToken !== verificationData.verificationCode) {
      throw new Error("Invalid verification code");
    }

    await UserRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    } as any);

    const verifiedUser = await UserRepository.getWithPersonById(user.id);
    const token = await generateToken(user.id);
    const { password: _, ...userWithoutPassword } = (verifiedUser || user) as any;
    await sendWelcomeEmail(user.email, "User");

    return {
      user: userWithoutPassword,
      token,
      message: "Email verified successfully.",
    };
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.getWithPersonById(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to retrieve user");
    }
  }

  async getUsers(params: GetUsersQueryDTO): Promise<{ users: IUser[]; pagination: any }> {
    if (!params) {
      throw new Error("Invalid parameters for getting all users");
    }

    try {
      const dbParams: any = { where: {} };

      // Handle include for relations (e.g., include: { posts: true })
      if (params.include && typeof params.include === 'object') {
        dbParams.include = params.include;
      } else {
        dbParams.include = { person: true };
      }

      // Handle query array (Prisma uses 'in' instead of '$in')
      const queryArray = Array.isArray(params.queryArray)
        ? params.queryArray
        : params.queryArray !== undefined
          ? [params.queryArray]
          : [];
      const queryArrayType = Array.isArray(params.queryArrayType)
        ? params.queryArrayType
        : params.queryArrayType !== undefined
          ? [params.queryArrayType]
          : [];

      if (queryArray.length > 0 && queryArrayType.length > 0) {

        queryArrayType.forEach((type: string | number) => {
          const trimmedType = String(type).trim();
          dbParams.where[trimmedType] = { in: queryArray };
        });
      }

      // Handle simple filters (e.g., "isVerified:true,name:John" or "address.city:Manila")
      if (params.filter && typeof params.filter === 'string') {
        const parsedFilter = parseFilterString(params.filter);
        if (parsedFilter) {
          dbParams.where = { ...dbParams.where, ...parsedFilter };
        }
      }

      // Handle sorting
      if (params.sort) {
        dbParams.orderBy = params.sort;
      }

      // Handle field selection (Prisma uses 'select')
      // Note: select and include cannot be used together in Prisma
      if (params.select && !dbParams.include) {
        const selectFields = Array.isArray(params.select)
          ? params.select.filter((f: string) => f && f.trim())
          : [params.select].filter((f: string) => f && f.trim());

        if (selectFields.length > 0) {
          dbParams.select = {};
          selectFields.forEach((field: string) => {
            dbParams.select[field] = true;
          });
        }
      }

      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      dbParams.skip = (page - 1) * limit;
      dbParams.take = limit;

      const [users, totalItems] = await Promise.all([
        UserRepository.docs(dbParams),
        UserRepository.count(dbParams.where),
      ]);

      const totalPages = Math.ceil(totalItems / limit);
      const pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { users, pagination };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }

  // Update user details by ID
  async updateUser(
    id: string,
    userData: UpdateUserDTO
  ): Promise<IUser | null> {
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
      throw new Error("Failed to update user");
    }
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete user");
    }
  }

  // Search users with specific criteria
  async searchUsers(search: string): Promise<IUser[]> {
    try {
      return await UserRepository.searchByEmailOrPersonName(search);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to search users");
    }
  }

  async getUser(id: string, params: GetUserQueryDTO): Promise<IUser | null> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const dbParams: any = {};

      // Handle field selection (Prisma uses 'select')
      if (params.select) {
        const selectFields = Array.isArray(params.select)
          ? params.select.filter((f: string) => f && f.trim())
          : [params.select].filter((f: string) => f && f.trim());

        if (selectFields.length > 0) {
          dbParams.select = {};
          selectFields.forEach((field: string) => {
            dbParams.select[field] = true;
          });
        }
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
