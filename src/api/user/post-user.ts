import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { MutationConfig } from '@/lib/react-query';
import { queryClient } from '@/main';
import { axios } from '@/lib/axios';

export const updateProfileInputSchema = z.object({
  email: z.string().min(1, "Email is required").email('Invalid email'),
  name: z.string().min(1, 'First name is required'),
  surname: z.string().min(1, 'Surname is required'),
  phone: z.string().min(1, "Phone is required"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const updateProfile = ({ data }: { data: UpdateProfileInput }) => {
  return axios.post(`/update-profile`, data);
};

type UseUpdateProfileOptions = {
  mutationConfig?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({
  mutationConfig,
}: UseUpdateProfileOptions = {}) => {

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({queryKey: ['user']})
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProfile,
  });
};