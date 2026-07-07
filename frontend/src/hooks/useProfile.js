import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '../services/UserService';
import { useAuth } from '../contexts/AuthContext';

export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await UserService.getProfile();
      return data;
    },
    enabled: !!user, // Only run the query if a user is logged in
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData) => {
      return await UserService.updateProfile(profileData);
    },
    onSuccess: () => {
      // Invalidate and refetch the profile after a successful update
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
