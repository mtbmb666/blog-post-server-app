import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-in')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    if (!email) throw new BadRequestException('Email is required')
    if (!password) throw new BadRequestException('Password is required')

    return await this.authService.signIn(email, password)
  }

  @Post('sign-up')
  async signUp(
    @Body('email') email: string,
  ) {
    if (!email) throw new BadRequestException('Email is required')

    return this.authService.signUp(email)
  }
}
