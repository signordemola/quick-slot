import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UserRole } from '@prisma/client';
import { hashPassword } from 'src/utils/password';
import { UpdateStaffByOwnerDto } from './dto/update-staff.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedBusiness: true },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (user.ownedBusiness) {
      throw new ConflictException('You already have a business set up!');
    }

    const defaultBusinessHours = {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    };

    return await this.prisma.business.create({
      data: {
        name: dto.name,
        description: dto.description,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        city: dto.city,
        country: dto.country || 'Nigeria',
        timezone: dto.timezone || 'Africa/Lagos',
        currency: dto.currency || 'NGN',
        businessHours: dto.businessHours || defaultBusinessHours,
        owner: { connect: { id: userId } },
      },
    });
  }

  async update(userId: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException(
        'Business not found. Please set up your business first!',
      );
    }

    return await this.prisma.business.update({
      where: { id: business.id },
      data: { ...dto },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async myBusiness(userId: string) {
    return await this.prisma.business.findUnique({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            staff: true,
            services: true,
            bookings: true,
          },
        },
      },
    });
  }

  async businessOwnerById(userId: string): Promise<string | null> {
    const business = await this.prisma.business.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    return business?.id || null;
  }

  // ============================================
  //          STAFF MANAGEMENT METHODS
  // ============================================

  async inviteStaff(ownerId: string, dto: InviteStaffDto) {
    const staffEmail = dto.email.toLowerCase().trim();

    const result = await this.prisma.business.findUnique({
      where: { ownerId },
      select: {
        id: true,
        staff: {
          where: {
            user: { email: staffEmail },
          },
          select: { id: true },
        },
        owner: {
          select: { id: true },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Business not found!');
    }

    if (result.staff.length > 0) {
      throw new ConflictException('Already a staff member!');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: staffEmail },
      select: { id: true, role: true },
    });

    if (existingUser) {
      const [staff] = await Promise.all([
        this.prisma.staff.create({
          data: {
            userId: existingUser.id,
            businessId: result.id,
            position: dto.position,
            bio: dto.bio,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        }),
        existingUser.role !== UserRole.STAFF
          ? this.prisma.user.update({
              where: { id: existingUser.id },
              data: { role: UserRole.STAFF },
            })
          : Promise.resolve(),
      ]);

      return staff;
    }

    const hash = await hashPassword('TempPassword!');

    return this.prisma.staff.create({
      data: {
        position: dto.position,
        bio: dto.bio,
        business: { connect: { id: result.id } },
        user: {
          create: {
            email: staffEmail,
            firstName: dto.firstName.toLowerCase().trim(),
            lastName: dto.lastName.toLowerCase().trim(),
            passwordHash: hash,
            role: UserRole.STAFF,
            isEmailVerified: false,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async allStaffs(ownerId: string) {
    const business = await this.prisma.business.findUnique({
      where: { ownerId },
    });

    if (!business) {
      throw new NotFoundException('Business not found!');
    }

    return await this.prisma.staff.findMany({
      where: { businessId: business.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true,
            isEmailVerified: true,
          },
        },
        _count: {
          select: {
            services: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStaffByOwner(
    ownerId: string,
    staffId: string,
    dto: UpdateStaffByOwnerDto,
  ) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found!');
    }

    if (staff.business.ownerId !== ownerId) {
      throw new ForbiddenException('Not authorized!');
    }

    return this.prisma.staff.update({
      where: { id: staffId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeStaff(ownerId: string, staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        business: {
          select: { id: true, ownerId: true },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
              },
            },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found!');
    }

    if (staff.business.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You can only remove staff from your own business!',
      );
    }

    if (staff._count.bookings > 0) {
      await this.prisma.staff.update({
        where: { id: staffId },
        data: { isActive: false },
      });
      return {
        message: 'Staff deactivated (has active bookings)!',
        deactivated: true,
      };
    }

    await this.prisma.staff.delete({
      where: { id: staffId },
    });

    return { message: 'Staff removed successfully!', deactivated: false };
  }
}
