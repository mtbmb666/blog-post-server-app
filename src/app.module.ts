import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    SettingsModule,
    CategoriesModule,
  ]
})
export class AppModule { }
