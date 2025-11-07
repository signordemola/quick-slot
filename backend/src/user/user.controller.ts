import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { JwtUser, UserWithoutPassword } from 'src/types';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser() user: JwtUser,
  ): Promise<UserWithoutPassword | null> {
    return this.userService.findUser({ id: user.id });
  }

  // Only ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all-users')
  getAllUsers() {
    return { message: 'Admin only route' };
  }

  // Both ADMIN and BUSINESS_OWNER
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUSINESS_OWNER)
  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtUser) {
    return {
      message: `Welcome!`,
      role: user.role,
    };
  }

  // ADMIN, BUSINESS_OWNER, and STAFF
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUSINESS_OWNER, UserRole.STAFF)
  @Get('bookings')
  getBookings() {
    return { message: 'Bookings management' };
  }
}
