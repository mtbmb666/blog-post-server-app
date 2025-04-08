import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async getUserData(userId: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        }
      })
      return user
    } catch (error) {
      throw new UnauthorizedException('User not found')
    }
  }

  extractUserIdFromToken(authToken: string): string {
    try {
      const payload = this.jwtService.verify<{ id: string }>(authToken)
      return payload.id
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true
      },
      take: 20
    })
  }
}
