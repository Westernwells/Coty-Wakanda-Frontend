import { axios } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
export async function exportProducts(): Promise<Blob> {
  const { data } = await axios.post(
    '/product-template',
    null,
    {
      headers: {
        Accept: 'application/vnd.api+json',
      },
      responseType: 'blob',
    }
  )
  return data
}
  export function useDownloadTemplateMutation() {
    return useMutation({
      mutationFn: exportProducts,
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'product-export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      },
      onError: (err: unknown) => {
        console.error('Failed to export products:', err)
      },
    })
  }