import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dtos/user.dto';
import { CreateGoogleUserDto } from './dtos/createGoogleUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserDto): Promise<UserDto> {
    // check user's existence
    let userExist = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });
    if (userExist) {
      throw new ConflictException();
    }
    // create account
    const hash = await this.hashPassword(user.password);
    const newUser = await this.prismaService.user.create({
      data: {
        email: user.email,
        password: hash,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    // extract and return only user's public data
    return this.getUserPublicData(newUser);
  }

  async createGoogleUser(user: CreateGoogleUserDto): Promise<UserDto> {
    const newUser = await this.prismaService.user.create({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: null,
      },
    });
    return this.getUserPublicData(newUser);
  }

  async getById(uuid: number): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        uuid,
      },
    });
    return this.getUserPublicData(user);
  }

  // method to be used by auth service
  async getByEmail(email: string): Promise<UserDto> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  getAll() {
    return this.prismaService.user.findMany();
  }

  async update(userId: number, userData: UpdateUserDto) {
    try {
      let updatedUser = await this.prismaService.user.update({
        where: { uuid: userId },
        data: userData,
      });
      return this.getUserPublicData(updatedUser);
    } catch (error) {
      throw new BadRequestException('User Update Failed');
    }
  }

  async updatePassword(userId: number, newPassword: string) {
    let hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      let updatedUser = await this.prismaService.user.update({
        where: { uuid: userId },
        data: { password: hashedPassword },
      });
      return this.getUserPublicData(updatedUser);
    } catch (error) {
      throw new BadRequestException('Password update Failed');
    }
  }

  delete(id: number) {
    return `deleted ${id}`;
  }

  updateRefreshToken(uuid: number, refreshToken: string | null) {
    return this.prismaService.user.update({
      where: { uuid },
      data: { hashedRt: refreshToken },
    });
  }

  // UTILS
  private async hashPassword(password: string): Promise<string> {
    let hashed = await bcrypt.hash(password, 10);
    return hashed;
  }

  private getUserPublicData(user: any): UserDto {
    const { password, ...publicData } = user;
    return publicData;
  }
}
