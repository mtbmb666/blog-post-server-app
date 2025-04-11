import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePostDto } from './posts.dto'

@Injectable()
export class PostsService {
	constructor(private readonly prisma: PrismaService) {}

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
}
