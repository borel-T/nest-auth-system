import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dtos';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './decorators/roles.enum';
import { RolesGuard } from './guards/roles.guards';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@UseInterceptors(CacheInterceptor) // this will auto-cache responses from any route of the service
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('')
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }

  @Get('cache-example')
  async cachedExample() {
    /* using manual cache methods */
    this.cacheManager.set('key', 'value', 5000); // set cache using key, value and TTL
    // this.cacheManager.get("key") // gets the cache by key
    // this.cacheManager.del("key") // deletes cache with this key
    // this.cacheManager.reset() // clears all cache
    /* using manual cache methods */

    const someSlowMethod = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (2 == 2) resolve(34);
        reject();
      }, 5000);
    });

    const res = await someSlowMethod
      .then((res) => 'AUTO-CACHED RESPONSE' + res)
      .catch((err) => {
        console.log(err);
        return 'bad';
      });
    return res;
  }

  @Roles(Role.USER) // roles metadata
  @UseGuards(JwtAuthGuard, RolesGuard) // guards execution order [1,2,..etc]
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getById(userId);
  }

  @Get('')
  async getAllUsers() {
    const allUSers = this.userService.getAll();
    return allUSers;
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() user: UpdateUserDto,
  ) {
    return this.userService.update(userId, user);
  }

  @Delete(':id')
  async deleteuser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.delete(userId);
  }
}
