import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('----------------- prisma module connect -----');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('----------------- prisma module dis-connect -----');
  }
}
