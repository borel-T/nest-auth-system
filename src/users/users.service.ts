import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/createUser.dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  getById(uuid: number) {
    return this.prismaService.user.findUnique({
      where: {
        uuid,
      },
    });
  }

  getAll() {
    return this.prismaService.user.findMany();
  }

  update(user: UpdateUserDto) {
    return `deleted ${user.toString()}`;
  }

  delete(id: number) {
    return `deleted ${id}`;
  }
}
