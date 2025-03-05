import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
// import { generateVerifyToken } from 'src/utils/generate-verify-token'
// import { sendVerificationEmail } from 'src/utils/send-verification-email'

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) { }

	async signIn(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		})

		if (!user || !user.password) {
			throw new UnauthorizedException('Invalid email or password')
		}

		const passwordMatch = await bcrypt.compare(password, user.password)
		if (!passwordMatch) {
			throw new UnauthorizedException('Invalid email or password')
		}

		const token = this.jwtService.sign({ id: user.id, email: user.email })

		await this.prisma.user.update({
			where: { id: user.id },
			data: { authToken: token },
		})

		return {
			message: 'Sign-in successful!',
			token,
		}
	}

	async signUp(email: string) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		})
		if (existingUser) {
			throw new ConflictException('User with this email already exists.')
		}

		const verifyToken = this.generateVerifyToken()
		const user = await this.prisma.user.create({
			data: {
				email,
				verifyToken,
			},
		})

		await sendVerificationEmail(user.email, verifyToken)
		return {
			message: 'User created successfully. Please check your email to verify your account.',
		}
	}


	private generateVerifyToken() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		const length = 52
		let result = ''
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length)
			result += characters[randomIndex]
		}
		return result
	}
}
