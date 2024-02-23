import { IsString, MinLength } from 'class-validator';

export class updatePasswordDto {
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  token: string;
}
