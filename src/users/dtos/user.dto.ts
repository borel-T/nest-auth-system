export class UserDto {
  uuid?: number;
  email: string;
  emailVerified?: boolean;
  firstName: string;
  lastName: string;
  password?: string;
  hashedRt?: string;
  createdAt: Date;
  updatedAt: Date;
}
