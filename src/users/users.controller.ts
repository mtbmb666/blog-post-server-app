import { Controller, Get, Param, Req } from '@nestjs/common'
import { Request } from 'express'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserData(
    @Param('id') userId: string,
    @Req() request: Request
  ) {
    const authToken = request.cookies?.authToken

    let requesterId: string | null = null
    if (authToken) {
      try {
        requesterId = this.usersService.extractUserIdFromToken(authToken)
      } catch {
        requesterId = null
      }
    }

    const user = await this.usersService.getUserData(userId)

    return {
      ...user,
      isThisMe: userId === requesterId,
      authorized: !!authToken
    }
  }
}
