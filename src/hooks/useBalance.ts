import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getBalance } from '../services/api';

export function useBalance() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['balance'],
    queryFn: getBalance,
    enabled: !!firebaseUser,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}
