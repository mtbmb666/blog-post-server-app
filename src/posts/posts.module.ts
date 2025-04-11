import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtConfigModule } from 'src/common/jwt-config.module'

@Module({
  imports: [JwtConfigModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService]
})
export class PostsModule {}
