import { IsString, IsBoolean, IsNotEmpty, IsUUID } from 'class-validator'

export class CreatePostDto {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@IsNotEmpty()
	content: string

	@IsBoolean()
	published: boolean

	@IsUUID()
	category: string
}
