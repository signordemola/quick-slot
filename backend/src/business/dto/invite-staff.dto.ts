import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class InviteStaffDto {
  @ApiProperty({ example: 'staff@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: 'Barber', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Expert in fades and trims', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}
