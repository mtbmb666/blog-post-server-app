import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtConfigModule } from 'src/common/jwt-config.module'

@Module({
  imports: [JwtConfigModule],
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
