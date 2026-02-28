import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: 'kakao',
      name: 'Kakao',
      type: 'oauth',
      authorization: {
        url: 'https://kauth.kakao.com/oauth/authorize',
        params: { scope: 'profile_nickname' },
      },
      token: 'https://kauth.kakao.com/oauth/token',
      userinfo: 'https://kapi.kakao.com/v2/user/me',
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? null,
          image: profile.kakao_account?.profile?.profile_image_url ?? null,
        };
      },
    },
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.userId = String((profile as Record<string, unknown>).id ?? account.providerAccountId);
        token.nickname = token.name ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.name = token.nickname as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
