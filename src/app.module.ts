import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'


@Module({
  imports: [
    AuthModule,
    PrismaModule,
    JwtModule.register({
      signOptions: { expiresIn: '2d' },
      secret: process.env.JWT_SECRET
    }),
  ]
})
export class AppModule { }
