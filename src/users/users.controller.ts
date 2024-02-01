import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('')
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getById(id);
  }

  @Get('')
  async getAllUsers() {
    return await this.userService.getAll();
  }

  @Put(':id')
  async updateUser(@Body() user: UpdateUserDto) {
    return this.userService.update(user);
  }

  @Delete(':id')
  async deleteuser(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
