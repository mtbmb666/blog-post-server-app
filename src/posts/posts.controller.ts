import { Request } from 'express'
import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PostsService } from './posts.service'
import { CreatePostDto } from './posts.dto'

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly jwtService: JwtService,
	) {}

	@Get()
	getAllPosts() {
		return this.postsService.getAllPosts()
	}

	private extractUserFromToken(authToken: string) {
		try {
			const payload = this.jwtService.verify(authToken)

			if (!payload?.id || !payload?.email) {
				throw new UnauthorizedException('Invalid token payload')
			}

			return { id: payload.id, email: payload.email }
		} catch (err) {
			throw new UnauthorizedException('Invalid or expired token')
		}
	}

	@Post()
	createPost(@Body() dto: CreatePostDto, @Req() req: Request) {
		const authToken = req.cookies?.authToken
		if (!authToken) throw new UnauthorizedException('Missing auth token')

		const user = this.extractUserFromToken(authToken)
		return this.postsService.createPost(dto, user.id)
	}

	@Delete()
	deletePost(@Body('id') id: string, @Req() req: Request) {
		const authToken = req.cookies?.authToken
		if (!authToken) throw new UnauthorizedException('Missing auth token')

		const user = this.extractUserFromToken(authToken)
		return this.postsService.deletePost(id, user.id)
	}
}
