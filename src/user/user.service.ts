import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create.user.dto';
import { LoginUserDto } from './login.user.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });
    if (existing) {
      throw new UnauthorizedException('User alrady exiest');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  // async login(data: LoginUserDto) {
  //   const user = await this.prisma.user.findFirst({
  //     where: {
  //       email: data.email,
  //     },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Email or Password not match');
  //   }

  //   const isMatch = await bcrypt.compare(data.password, user.password);

  //   if (!isMatch) {
  //     throw new UnauthorizedException('Email or Password not match');
  //   }

  //   const accessToken = await this.jwtService.signAsync(
  //     {
  //       email: user.email,
  //       name: user.name,
  //       id: user.id,
  //       role: user.role,
  //     },
  //     { expiresIn: '1d' },
  //   );

  //   return accessToken;
  // }

  async googleLogin(user: { email: string; name: string }) {
    let existingUser = await this.prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: '',
        },
      });
    }

    const accessToken = await this.jwtService.signAsync({
      email: existingUser.email,
      name: existingUser.name,
      id: existingUser.id,
      role: existingUser.role,
    });

    return {
      accessToken,
      user: existingUser,
    };
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
