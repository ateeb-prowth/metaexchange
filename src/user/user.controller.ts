import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create.user.dto';
import { LoginUserDto } from './login.user.dto';
import { AuthGuard } from './auth.guard';
import { Roles } from 'src/roles/role.decorator';
import { Role } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { AuthGuard as GoogleAuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() createUserdto: CreateUserDto) {
    return this.userService.create(createUserdto);
  }

  // @Get()
  // async login(@Body() loginUserdto: LoginUserDto) {
  //   return this.userService.login(loginUserdto);
  // }

  @Get('/auth/google')
  @UseGuards(GoogleAuthGuard('google'))
  async googleAuth() {
    // redirect to Google
  }

  @Get('/auth/google/callback')
  @UseGuards(GoogleAuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const data = await this.userService.googleLogin(req.user);
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?token=${data.accessToken}`,
    );
    // return this.userService.googleLogin(req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('/profile')
  @Roles(Role.User)
  async getProfile(@Request() req) {
    return req.user;
  }
}
