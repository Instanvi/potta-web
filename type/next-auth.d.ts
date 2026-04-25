import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      accessToken?: string;
      role?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    username?: string | null;
    accessToken?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string | null;
    accessToken?: string;
    role?: string;
  }
}
