import { useQuery } from "@tanstack/react-query";

const useGetUsers = (users, session) => {
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: !!session && users.length == 0,
    staleTime: 15 * 60 * 1000,
  });

  return {
    usersData,
    isLoading,
  };
};

export default useGetUsers;
