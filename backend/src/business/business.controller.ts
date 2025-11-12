import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/types';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @Get('profile')
  async getMyBusiness(@CurrentUser() user: JwtUser) {
    const business = await this.businessService.getMyBusiness(user.id);
    return {
      business,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @Post('create')
  async createBusiness(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateBusinessDto,
  ) {
    const business = await this.businessService.createBusiness(user.id, dto);
    return {
      message: 'Business created successfully!',
      business,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @Patch('edit')
  async updateBusiness(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateBusinessDto,
  ) {
    const business = await this.businessService.updateBusiness(user.id, dto);
    return {
      message: 'Business updated successfully!',
      business,
    };
  }
}
