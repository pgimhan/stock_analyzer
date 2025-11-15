import { useQuery } from "@tanstack/react-query";
import { getSession, type Session } from "@/lib/auth";

export function useAuth() {
  const { data: session, isLoading } = useQuery<Session | null>({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading,
  };
}
