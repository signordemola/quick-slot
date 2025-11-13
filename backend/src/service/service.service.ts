import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateServiceDto) {
    const business = await this.prisma.business.findUnique({
      where: { ownerId },
      include: {
        staff: {
          where: { id: dto.staffId },
          select: { id: true, isActive: true },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found!');
    }

    const staff = business.staff[0];
    if (!staff) {
      throw new BadRequestException(
        'Staff member not found or does not belong to your business!',
      );
    }

    if (!staff.isActive) {
      throw new BadRequestException(
        'Cannot assign services to inactive staff!',
      );
    }

    try {
      return await this.prisma.service.create({
        data: {
          name: dto.name,
          description: dto.description,
          durationMins: dto.durationMins,
          price: new Decimal(dto.price),
          currency: dto.currency || 'NGN',
          isActive: true,
          businessId: business.id,
          staffId: dto.staffId,
        },
        include: {
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          business: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Service with this name already exists for this staff member!',
        );
      }
      throw error;
    }
  }

  async findAll(businessId?: string, staffId?: string) {
    const where: Prisma.ServiceWhereInput = { isActive: true };

    if (businessId) where.businessId = businessId;
    if (staffId) where.staffId = staffId;

    return await this.prisma.service.findMany({
      where,
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            businessHours: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found!');
    }

    return service;
  }

  async findByBusiness(businessId: string) {
    return await this.prisma.service.findMany({
      where: {
        businessId,
        isActive: true,
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByStaff(staffId: string) {
    return await this.prisma.service.findMany({
      where: {
        staffId,
        isActive: true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.business.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own services');
    }

    if (dto.staffId) {
      const staff = await this.prisma.staff.findFirst({
        where: {
          id: dto.staffId,
          businessId: service.businessId,
          isActive: true,
        },
      });

      if (!staff) {
        throw new BadRequestException('Staff member not found or inactive');
      }
    }

    return await this.prisma.service.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price !== undefined ? new Decimal(dto.price) : undefined,
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(ownerId: string, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
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

    if (!service) {
      throw new NotFoundException('Service not found!');
    }

    if (service.business.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own services!');
    }

    if (service._count.bookings > 0) {
      await this.prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        message: 'Service deactivated (has active bookings)!',
        deactivated: true,
      };
    }

    await this.prisma.service.delete({
      where: { id },
    });

    return {
      message: 'Service deleted successfully!',
      deactivated: false,
    };
  }

  async toggleActive(ownerId: string, id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found!');
    }

    if (service.business.ownerId !== ownerId) {
      throw new ForbiddenException('Access denied!');
    }

    return await this.prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });
  }
}
