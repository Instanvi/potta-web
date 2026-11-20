import { authClient } from '@/config/axios.config';
import type { GetSessionResponse } from '@/types/auth';

export const authService = {
  async getSession(): Promise<GetSessionResponse> {
    const res = await authClient.post<GetSessionResponse>('/get-session', {});
    return res.data;
  },

  async logout(): Promise<void> {
    await authClient.post('/auth/sign-out', {});
  },
};
