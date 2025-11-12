import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async createBusiness(userId: string, dto: CreateBusinessDto) {
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

  async updateBusiness(userId: string, dto: UpdateBusinessDto) {
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

  async getMyBusiness(userId: string) {
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
}
