import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { CreatePostDto } from './posts.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Request } from 'express'

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	getAllPosts() {
		return this.postsService.getAllPosts()
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	createPost(@Body() dto: CreatePostDto, @Req() req: Request) {
		const userId = req.user['id']
		return this.postsService.createPost(dto, userId)
	}

	@UseGuards(JwtAuthGuard)
	@Delete()
	deletePost(@Body('id') id: string, @Req() req: Request) {
		const userId = req.user['id']
		return this.postsService.deletePost(id, userId)
	}
}
