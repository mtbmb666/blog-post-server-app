import { Body, Controller, Get, Post, Put, Query, Req, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  async getMySettings(
    @Req() request: Request
  ) {
    const authToken = request.cookies?.authToken

    if (!authToken) {
      throw new UnauthorizedException('User not authorized')
    }

    const requesterId = this.settingsService.extractUserIdFromToken(authToken)

    const user = await this.settingsService.getPublicSettings(requesterId)
    return {
      ...user,
      isThisMe: requesterId === user.id,
      authorized: !!authToken
    }
  }

  @Get('username-availability')
  async checkUsernameAvailability(@Query('username') username: string) {
    if (!username) {
      return { isAvailable: false, error: 'Username is required' }
    }

    const isAvailable = !(await this.settingsService.checkUsernameAvailability(username))
    return { isAvailable }
  }

  @Put()
  async setMySettings(
    @Req() request: Request,
    @Body() body: publicSettings
  ) {
    const authToken = request.cookies?.authToken
    console.log(authToken)

    if (!authToken) {
      throw new UnauthorizedException('User not authorized')
    }

    const requesterId = this.settingsService.extractUserIdFromToken(authToken)

    return await this.settingsService.setSettings(requesterId, body)
  }

  @Post('set-password')
  async setPassword(
    @Req() request: Request,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    const authToken = request.cookies?.authToken

    if (!authToken) {
      throw new UnauthorizedException('User not authorized')
    }

    const requesterId = this.settingsService.extractUserIdFromToken(authToken)

    return await this.settingsService.setPassword(requesterId, oldPassword, newPassword)
  }
}
