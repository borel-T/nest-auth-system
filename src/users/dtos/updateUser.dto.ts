import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dtos';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
