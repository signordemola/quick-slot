import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStaffByOwnerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// For staff to edit their own profile
// export class UpdateStaffProfileDto {
//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   bio?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsString()
//   phoneNumber?: string;
// }
