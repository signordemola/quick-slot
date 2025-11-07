import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword } from 'src/utils/password';
import {
  AuthResponse,
  AuthSignInResponse,
  JwtPayload,
  Tokens,
} from 'src/types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateTokens(payload: { id: string; role: string }): Tokens {
    const jwtPayload = { sub: payload.id, role: payload.role };

    const access_token: string = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '1h'),
    });

    const refresh_token: string = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered!');
    }

    const hash = await hashPassword(dto.password);

    await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName.toLocaleLowerCase().trim(),
        lastName: dto.lastName.toLocaleLowerCase().trim(),
        passwordHash: hash,
        phoneNumber: dto.phoneNumber,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully!',
    };
  }

  async login(dto: LoginDto): Promise<AuthSignInResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLocaleLowerCase().trim(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const isPasswordValid: boolean = await verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const tokens = this.generateTokens({
      id: user.id,
      role: user.role,
    });

    return {
      ...tokens,
      user: { id: user.id, role: user.role },
    };
  }

  async refreshTokens(refresh_token: string): Promise<Tokens> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refresh_token,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return this.generateTokens({ id: user.id, role: user.role });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token!');
    }
  }
}
