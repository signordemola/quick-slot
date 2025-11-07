import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @ApiProperty({ example: '09023293833' })
  phoneNumber?: string;
}
