import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/types';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ApiOperation } from '@nestjs/swagger';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateStaffByOwnerDto } from './dto/update-staff.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Get my business details' })
  async getMyBusiness(@CurrentUser() user: JwtUser) {
    const business = await this.businessService.myBusiness(user.id);
    return {
      business,
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create business (one-time)' })
  async createBusiness(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateBusinessDto,
  ) {
    const business = await this.businessService.create(user.id, dto);
    return {
      message: 'Business created successfully!',
      business,
    };
  }

  @Patch('edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update business details' })
  async updateBusiness(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateBusinessDto,
  ) {
    const business = await this.businessService.update(user.id, dto);
    return {
      message: 'Business updated successfully!',
      business,
    };
  }

  // ============================================
  // STAFF ENDPOINTS
  // ============================================

  @Get('/staffs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Get all staff members' })
  async getAllStaffs(@CurrentUser() user: JwtUser) {
    return await this.businessService.allStaffs(user.id);
  }

  @Post('staff/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite staff member' })
  async inviteStaff(@CurrentUser() user: JwtUser, @Body() dto: InviteStaffDto) {
    const staff = await this.businessService.inviteStaff(user.id, dto);
    return { message: 'Staff invited successfully!', staff };
  }

  @Patch('staff/:staffId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Business owner updates staff details' })
  async updateStaff(
    @CurrentUser() user: JwtUser,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffByOwnerDto,
  ) {
    const staff = await this.businessService.updateStaffByOwner(
      user.id,
      staffId,
      dto,
    );
    return { message: 'Staff updated successfully!', staff };
  }

  @Delete('staff/:staffId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Remove staff member' })
  async removeStaff(
    @CurrentUser() user: JwtUser,
    @Param('staffId') staffId: string,
  ) {
    return this.businessService.removeStaff(user.id, staffId);
  }
}
