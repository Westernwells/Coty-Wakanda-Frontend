import { Link, createFileRoute } from '@tanstack/react-router'

import AddProductForm from '@/components/AddProduct/Form'
import { Button } from '@mantine/core'
import { ChevronDownIcon } from 'lucide-react'
import Headline from '@/components/Shared/Headline'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '@/api/products/get-product'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'

export const Route = createFileRoute('/_auth/edit-product/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { productId } = Route.useParams()
   const { data, isLoading } = useQuery({
    queryKey: ["products", productId],
    queryFn: () => getProduct(productId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <Headline title="Edit product" />
      <section className="mt-3 sm:mt-8">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/products"
        >
          Back to Product
        </Button>
      </section>
      <AddProductForm product={data?.data} isEdit />
    </div>
  )
}
