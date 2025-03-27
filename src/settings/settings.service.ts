import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SettingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) { }

	async getPublicSettings(userId: string) {
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

	async checkUsernameAvailability(username: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { username },
		})
		return !!user
	}

	async setSettings(requesterId: string, settings: publicSettings) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: requesterId
			}
		})

		if (!user) {
			throw new NotFoundException('User with this id not found')
		}

		return await this.prisma.user.update({
			where: {
				id: requesterId
			},
			data: {
				avatar: settings.avatar,
				email: settings.email,
				username: settings.username,
				name: settings.name,
			},
			omit: {
				password: true,
				verifyToken: true,
				authToken: true
			}
		})
	}

	async setPassword(requesterId: string, oldPassword: string, newPassword: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: requesterId },
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		if (!user.password) {
			throw new BadRequestException('User not verified.')
		}

		const isMatch = await bcrypt.compare(oldPassword, user.password)
		if (!isMatch) {
			throw new BadRequestException('Old password is incorrect')
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10)

		await this.prisma.user.update({
			where: { id: requesterId },
			data: { password: hashedPassword },
		})

		return { message: 'Password updated successfully' }
	}
}
