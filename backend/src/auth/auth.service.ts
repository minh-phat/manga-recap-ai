import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private buildToken(userId: string, email: string, role: UserRole) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'user',
      createdAt: new Date(),
    });

    const accessToken = this.buildToken(
      user._id!.toString(),
      user.email,
      user.role,
    );
    return {
      accessToken,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role: UserRole = user.role ?? 'user';
    const accessToken = this.buildToken(user._id!.toString(), user.email, role);
    return {
      accessToken,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role,
      },
    };
  }
}
