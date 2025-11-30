import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import { willTokenExpireSoon, getTokenExpiryTime } from '../jwt';
import { toast } from 'sonner';

/**
 * Hook to automatically refresh access token before it expires
 * This ensures seamless user experience without interruptions
 */
export function useTokenRefresh() {
  const { accessToken, refreshAccessToken, isAuthenticated, _hasHydrated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Only run if authenticated and hydrated
    if (!isAuthenticated || !_hasHydrated || !accessToken) {
      return;
    }

    const checkAndRefreshToken = async () => {
      // Avoid concurrent refresh attempts
      if (isRefreshingRef.current) {
        return;
      }

      try {
        // Check if token will expire in the next 5 minutes
        if (willTokenExpireSoon(accessToken, 5)) {
          isRefreshingRef.current = true;

          // Refresh the token
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // The auth store will handle logout on refresh failure
        toast.error('Session expired. Please sign in again.');
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Set up interval to check every minute
    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [accessToken, isAuthenticated, _hasHydrated, refreshAccessToken]);

  // Also set up a timeout to refresh at the exact expiry time
  useEffect(() => {
    if (!isAuthenticated || !_hasHydrated || !accessToken) {
      return;
    }

    const timeUntilExpiry = getTokenExpiryTime(accessToken);

    // If token expires in more than 5 minutes, set a timeout to refresh 5 minutes before
    if (timeUntilExpiry > 5 * 60 * 1000) {
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

      const timeout = setTimeout(async () => {
        if (!isRefreshingRef.current) {
          try {
            isRefreshingRef.current = true;
            await refreshAccessToken();
          } catch (error) {
            console.error('Failed to refresh token at scheduled time:', error);
          } finally {
            isRefreshingRef.current = false;
          }
        }
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [accessToken, isAuthenticated, _hasHydrated, refreshAccessToken]);
}
