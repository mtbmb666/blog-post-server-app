import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePostDto } from './posts.dto'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class PostsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) { }

	async getAllPosts() {
		const posts = await this.prisma.post.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				author: {
					select: { id: true, name: true, username: true },
				},
				postTags: {
					select: { tag: { select: { name: true } } },
				},
				category: {
					select: { id: true, name: true },
				},
			},
		})

		return posts.map(post => ({
			...post,
			tags: post.postTags.map(pt => pt.tag),
			postTags: undefined,
		}))
	}

	async createPost(dto: CreatePostDto, userId: string) {
		const categoryExists = await this.prisma.category.findUnique({
		  where: { id: dto.category },
		})
	  
		if (!categoryExists) {
		  throw new NotFoundException('Category not found')
		}
	  
		const newPost = await this.prisma.post.create({
		  data: {
			title: dto.title,
			content: dto.content,
			published: dto.published,
			category: { connect: { id: dto.category } },
			author: { connect: { id: userId } },
		  },
		})
	  
		return { postId: newPost.id }
	  }
	  

	async deletePost(postId: string, userId: string) {
		const post = await this.prisma.post.findUnique({
			where: { id: postId },
		})

		if (!post || post.authorId !== userId) {
			throw new NotFoundException('Post not found or unauthorized')
		}

		await this.prisma.post.delete({ where: { id: postId } })
		return { message: 'Post deleted successfully' }
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

	async getPostById(id: string) {
		return this.prisma.post.findUnique({
			where: { id },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						username: true,
					},
				},
				category: {
					select: {
						id: true,
						name: true,
					},
				},
				postTags: {
					select: {
						tag: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})
	}
	
}
