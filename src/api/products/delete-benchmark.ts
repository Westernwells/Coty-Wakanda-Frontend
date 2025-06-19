// src/api/deleteBenchmark.ts

import { axios } from "@/lib/axios"
import { queryClient } from "@/main"
import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query"

export async function deleteBenchmark(productId: number): Promise<void> {
  await axios.delete(
    `/products/${productId}/benchmark`,
   
  )
}

export function useDeleteBenchmark(
    options?: UseMutationOptions<
      void,    
      unknown, 
      number,  
      unknown  
    >
  ): UseMutationResult<void, unknown, number, unknown> {  
    return useMutation<void, unknown, number, unknown>({
      mutationFn: deleteBenchmark,
      onSuccess(data, productId, context) {
        queryClient.invalidateQueries({
          queryKey: ['offering-products'],
          exact: true,
        })
  
        options?.onSuccess?.(data, productId, context)
      },

      onError(error, productId, context) {
        console.error('Failed to delete benchmark:', error)
        // 2) then call user-supplied onError (if any)
        options?.onError?.(error, productId, context)
      },
  
      ...options,
    })
  }