import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async getUserData(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: {
        password: true,
        verifyToken: true,
        authToken: true
      }
    })
  }

  extractUserIdFromToken(authToken: string): string {
    try {
      const payload = this.jwtService.verify<{ id: string }>(authToken)
      return payload.id
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
