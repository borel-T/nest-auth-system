export class UserDto {
  uuid?: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  hashedRt?: string;
  createdAt: Date;
  updatedAt: Date;
}
