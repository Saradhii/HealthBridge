import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth';

export const useAuth = (redirectTo: string = '/signin') => {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only redirect if hydration is complete and user is not authenticated
    if (_hasHydrated && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [_hasHydrated, isAuthenticated, router, redirectTo]);

  return {
    user,
    isAuthenticated,
    isLoading: !_hasHydrated
  };
};
