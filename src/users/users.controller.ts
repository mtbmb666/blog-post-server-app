import { Controller, Get, Param, Query, Req, UnauthorizedException } from '@nestjs/common'
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
      } catch (err) {
        console.error('Error extracting user ID from token:', err)
        requesterId = null
      }
    }

    try {
      const user = await this.usersService.getUserData(userId)
      
      return {
        ...user,
        isThisMe: userId === requesterId,
        authorized: !!authToken
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw new UnauthorizedException('User not found or invalid data')
    }
  }

  @Get('search')
  async search(@Query('query') query: string) {
    if (!query || query.trim() === '') {
      return { error: 'Query parameter is required' }
    }

    try {
      const users = await this.usersService.searchUsers(query)
      return users
    } catch (error) {
      console.error('Error searching users:', error)
      return { error: 'Failed to search users' }
    }
  }
}
