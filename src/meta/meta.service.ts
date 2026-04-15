import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MetaService {
  constructor(public prisma: PrismaService) {}

  getAuthUrl(userId: number) {
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${process.env.META_REDIRECT_URI}&scope=ads_read,ads_management,business_management&state=${userId}`;

    return url;
  }

  async handleCallback(code: string, userId: number) {
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        },
      },
    );

    const accessToken = tokenRes.data.access_token;

    // await this.prisma.metaAccount.update({
    //   where: {
    //     userId: Number(userId),
    //   },
    //   data: {
    //     accessToken,
    //   },
    // });

    const accountsRes = await axios.get(
      `https://graph.facebook.com/v19.0/me/adaccounts`,
      {
        params: { access_token: accessToken },
      },
    );

    const accounts = accountsRes.data.data;

    for (const acc of accounts) {
      await this.prisma.metaAccount.upsert({
        where: {
          userId_accountId: {
            userId: Number(userId),
            accountId: acc.id,
          },
        },
        update: {
          accessToken,
        },
        create: {
          userId: Number(userId),
          accountId: acc.id,
          accessToken,
        },
      });
    }

    return {
      message: 'Meta connected successfully',
      accountsCount: accounts.length,
    };
  }

  async getAdAccounts(token: string) {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/me/adaccounts`,
      {
        params: {
          access_token: token,
        },
      },
    );

    return res.data;
  }

  async getUserMetaAccounts(userId: number) {
    return this.prisma.metaAccount.findMany({
      where: { userId },
    });
  }

  async getInsights(accessToken: string, accountId: string) {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/${accountId}/insights`,
      {
        params: {
          access_token: accessToken,
          fields: 'impressions,clicks,spend,ctr,cpc',
          date_preset: 'last_7d', // you can change later
        },
      },
    );

    return res.data;
  }
}
