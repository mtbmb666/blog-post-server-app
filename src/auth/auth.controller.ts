import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import { Response, Request } from 'express'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  async getUserData(
    @Req() request: Request
  ) {
    const authToken = request.cookies?.authToken
    console.log(request.cookies)

    if (!authToken) {
      throw new UnauthorizedException('No auth token provided')
    }

    return await this.authService.getUserData(authToken)
  }

  @Get('users')
  async getUsersData() {
    return await this.authService.getUsersData()
  }

  @Get('delete')
  async deleteUsers() {
    return await this.authService.deleteUsers()
  }

  @Post('sign-in')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response
  ) {
    if (!email) throw new BadRequestException('Email is required')
    if (!password) throw new BadRequestException('Password is required')

    const { authToken } = await this.authService.signIn(email, password)

    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    })

    return res.json({ message: 'Sign-in successful!' })
  }

  @Post('sign-up')
  async signUp(
    @Body('email') email: string,
  ) {
    if (!email) throw new BadRequestException('Email is required')

    return this.authService.signUp(email)
  }

  @Post('verify')
  async verifyAccount(
    @Body('verifyToken') verifyToken: string,
    @Body('name') name: string,
    @Body('password') password: string,

    @Res() res: Response
  ) {
    if (!verifyToken) throw new BadRequestException('Email is required')
    if (!name) throw new BadRequestException('Email is required')
    if (!password) throw new BadRequestException('Email is required')

    const { authToken } = await this.authService.verifyAccount(verifyToken, name, password)

    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    })

    return res.json({ message: 'Sign-in successful!' })
  }
}
