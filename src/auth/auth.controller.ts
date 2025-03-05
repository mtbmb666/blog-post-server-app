import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
      sameSite: 'strict'
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
}
