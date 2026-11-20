import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth';
import { AuthSessionResponse } from '@/types/auth';
import { usePermissionStore } from '@/lib/store/permission-store';

export const useGetAuthSession = (
  options?: UseMutationOptions<AuthSessionResponse>
) =>
  useMutation({
    mutationFn: (): Promise<AuthSessionResponse> => authService.authSession(),
    ...options,
  });

export const usePermission = () => {
  const { hasPermission, permissions, clearPermissions } = usePermissionStore();

  return {
    can: hasPermission,
    permissions,
    clear: clearPermissions,
  };
};
