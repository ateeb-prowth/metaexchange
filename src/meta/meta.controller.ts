import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { AuthGuard } from 'src/user/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('meta')
export class MetaController {
  constructor(
    private metaService: MetaService,
    private jwtService: JwtService,
  ) {}

  // @UseGuards(AuthGuard)
  @Get('connect')
  connectMeta(@Req() req, @Res() res) {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
    const decoded: any = this.jwtService.decode(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const url = this.metaService.getAuthUrl(decoded.id);
    return res.redirect(url);
  }

  @Get('callback')
  async handleCallback(@Req() req, @Res() res) {
    const { code, state } = req.query;
    await this.metaService.handleCallback(code, state);
    return res.redirect('http://localhost:3001/dashboard');
  }

  //   @UseGuards(AuthGuard)
  //   @Get('ad-accounts')
  //   async getAdAccounts(@Req() req) {
  //     const account = await this.metaService.prisma.metaAccount.findFirst({
  //       where: { userId: req.user.id },
  //     });

  //     return this.metaService.getAdAccounts(account.accessToken);
  //   }

  //   @UseGuards(AuthGuard)
  //   @Get('ad-accounts')
  //   async getAdAccounts(@Req() req) {
  //     const account = await this.metaService.getUserMetaAccount(req.user.id);

  //     if (!account) {
  //       return { message: 'Meta not connected' };
  //     }

  //     return this.metaService.getAdAccounts(account.accessToken);
  //   }

  @UseGuards(AuthGuard)
  @Get('accounts')
  async getAccounts(@Req() req) {
    return this.metaService.getUserMetaAccounts(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('insights')
  async getInsights(@Req() req) {
    const { accountId } = req.query;

    const account = await this.metaService.prisma.metaAccount.findFirst({
      where: {
        userId: req.user.id,
        accountId: accountId,
      },
    });

    if (!account) {
      return { message: 'Account not found' };
    }

    return this.metaService.getInsights(account.accessToken, accountId);
  }
}
