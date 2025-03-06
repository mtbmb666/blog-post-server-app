import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import nodemailer from 'nodemailer'

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
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

		const authToken = this.jwtService.sign({ id: user.id, email: user.email })

		await this.prisma.user.update({
			where: { id: user.id },
			data: { authToken },
		})

		return {
			authToken
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

		await this.sendVerificationEmail(user.email, verifyToken)
		return {
			message: 'User created successfully. Please check your email to verify your account.',
		}
	}

	async verifyAccount(
		verifyToken: string,
		name: string,
		password: string
	) {
		const existingUser = await this.prisma.user.findFirstOrThrow({
			where: { verifyToken }
		})
		const authToken = this.jwtService.sign({ id: existingUser.id, email: existingUser.email })
		await this.prisma.user.update({
			where: {
				id: existingUser.id
			},
			data: {
				name,
				password,
				authToken,
				verifyToken: null
			}
		})

		return { authToken }
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

	private async sendVerificationEmail(email: string, verifyToken: string) {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		})

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Welcome to our NextJs Blog Post App',
			text: `Please click on the following link to verify your email: ${process.env.APP_URL}/auth/activate?verifytoken=${verifyToken}`,
		}

		await transporter.sendMail(mailOptions)
	}
}
