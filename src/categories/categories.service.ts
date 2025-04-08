import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        posts: {
          select: {
            id: true,
            viewCount: true,
          },
        },
      },
    })

    return categories
      .map((category) => {
        const postsCount = category.posts.length
        const viewCount = category.posts.reduce((sum, post) => sum + post.viewCount, 0)

        return {
          id: category.id,
          name: category.name,
          postsCount,
          viewCount,
        }
      })
      .sort((a, b) => {
        if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount
        return b.postsCount - a.postsCount
      })
  }
}
