import { Person, User, UserRole } from '@prisma/client';

// Export Prisma-generated User type
export type IUser = User;
export type IPerson = Person;
export type IUserRole = UserRole;
export type IUserStatus = 'ACTIVE' | 'INACTIVE';

// Address type (matches Prisma schema)
export type AddressType = {
  street?: string | null;
  barangay?: string | null;
  city?: string | null;
  municipality?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

export type PersonInput = {
  firstName: string;
  lastName: string;
  description?: string | null;
  birthday?: Date;
  age?: number;
  phoneNumber?: string;
  address?: AddressType;
};

// User creation data (for registration)
export type UserCreateInput = {
  name?: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: IUserStatus;
  address?: AddressType;
  person?: PersonInput;
  lastLogin?: Date;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
};

// User update data
export type UserUpdateInput = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>>;
