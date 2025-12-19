import { useAuth } from '@/contexts/AuthContext';

export function useAdmin() {
  const { user } = useAuth();

  const isAdmin = user?.user_metadata?.role === 'admin';

  return {
    isAdmin,
    user,
  };
}
