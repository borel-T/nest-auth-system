import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}
