import { comparePassword, hashPassword } from "../config/bcrypt";
import UserRepository from "../repository/userRepository";
import { IUser } from "../types/index";
import generateToken from "../util/generateToken";
import parseFilterString from "../util/parseFilterString";
import {
  CreateUserDTO,
  GetUserQueryDTO,
  GetUsersQueryDTO,
  LoginDTO,
  UpdateUserDTO,
} from "../util/validation/userZod";

class UserService {
  // Create a new user
  async createUser(
    userData: CreateUserDTO
  ): Promise<{ token: string; user: Omit<IUser, 'password'> }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (userExists) {
      throw new Error("User already exists");
    }
    const hashedPassword = await hashPassword(userData.password!);
    const { person, name, address, ...accountData } = userData;
    const personPayload = person || {
      name: name as string,
      address,
    };
    const newUser = await UserRepository.add({
      ...accountData,
      password: hashedPassword,
      person: {
        create: personPayload,
      },
    } as any);
    const userWithPerson = await UserRepository.getWithPersonById(newUser.id);
    const token = await generateToken(newUser.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = (userWithPerson || newUser) as any; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
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
    if (!userExists.isVerified) {
      throw new Error("Account is not verified");
    }
    const token = await generateToken(userExists.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = userExists; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
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
