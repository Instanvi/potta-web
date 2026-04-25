import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { User, AuthResponse } from './types/auth';
import axios from 'axios';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
  },

  providers: [
    Credentials({
      id: 'session-sync',
      name: 'Session Sync',
      credentials: {
        token: { label: 'Token', type: 'text' },
        organizationId: { label: 'Organization ID', type: 'text' },
        userJSON: { label: 'User JSON', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        console.log('Credentials', credentials);

        try {
          let userFromLogin: User | undefined;
          let resData: AuthResponse | null = null;
          const accessToken = credentials.token as string;

          console.log('Access Token', accessToken);
          const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL!;

          try {
            const userResponse = await axios.post(
              `${authApiUrl}/get-session`,
              null,
              { headers: { Authorization: `Bearer ${credentials.token}` } }
            );

            resData = (userResponse.data.data ||
              userResponse.data) as AuthResponse;
            userFromLogin = resData?.user;
          } catch (error) {
            console.error('Error fetching user:', error);
            return null;
          }

          if (!userFromLogin) {
            return null;
          }

          const user: User = {
            id: userFromLogin.id,
            email: userFromLogin.email,
            name:
              userFromLogin.name ||
              userFromLogin.username ||
              userFromLogin.email,
            image: userFromLogin.image,
            accessToken: accessToken,
            role: userFromLogin.role,
          };

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
});
