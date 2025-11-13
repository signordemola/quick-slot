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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/types';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create service' })
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateServiceDto) {
    const service = await this.service.create(user.id, dto);
    return {
      message: 'Service created successfully',
      service,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all services (public)' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'staffId', required: false })
  async findAll(
    @Query('businessId') businessId?: string,
    @Query('staffId') staffId?: string,
  ) {
    return await this.service.findAll(businessId, staffId);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get services by business (public)' })
  async findByBusiness(@Param('businessId') businessId: string) {
    return await this.service.findByBusiness(businessId);
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get services by staff (public)' })
  async findByStaff(@Param('staffId') staffId: string) {
    return await this.service.findByStaff(staffId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service details (public)' })
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Update service' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const service = await this.service.update(user.id, id, dto);
    return {
      message: 'Service updated successfully',
      service,
    };
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Toggle service active status' })
  async toggleActive(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    const service = await this.service.toggleActive(user.id, id);
    return {
      message: 'Service status updated',
      service,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service' })
  async remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return await this.service.remove(user.id, id);
  }
}
