import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'example@email.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsStrongPassword()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 5,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    { message: 'Please provide a stronger password' },
  )
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '09023293833' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  phoneNumber: string;
}
