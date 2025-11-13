import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsObject,
  MaxLength,
} from 'class-validator';

export class UpdateBusinessDto {
  @ApiProperty({ example: 'My Business', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'This is my business description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'owner@mybusiness.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Business St.', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Lagos State', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Nigeria', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Africa/Lagos', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'NGN', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  businessHours?: {
    monday?: { open: string; close: string; closed: boolean };
    tuesday?: { open: string; close: string; closed: boolean };
    wednesday?: { open: string; close: string; closed: boolean };
    thursday?: { open: string; close: string; closed: boolean };
    friday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
}
