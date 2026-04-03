import axios from '@instanvi/utilities';
import { AuthSessionResponse } from '@/types/auth';

const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL!;

export const authService = {
  async authSession() {
    const res = await axios.post<AuthSessionResponse>(
      `${authApiUrl}/get-session`,
      {}
    );
    return res.data;
  },
};
