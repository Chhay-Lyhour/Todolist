import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @IsOptional()
  @MaxLength(60)
  username?: string;

  @IsNotEmpty()
  @MaxLength(60)
  displayName: string;
}
