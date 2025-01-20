import { Link, createFileRoute } from '@tanstack/react-router'

import { Button, Loader } from '@mantine/core'
import Filter from '@/components/HomePage/Filter'
import Headline from '@/components/Shared/Headline'
import PlusIcon from '@/components/Icons/PlusIcon'
import ProductsTable from '@/components/HomePage/ProductsTable'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/products/get-products'
import { Filters, Product } from '@/types'

export const Route = createFileRoute('/_auth/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    region: '',
    market: '',
    brand: '',
    brandPillar: '',
    distributor: '',
    productType: '',
  })
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ page: 1, per_page: 9999999 }),
  })

  
  if (error) {
    return (
      <div className="w-full">
        <Headline title="Products" />
        <div className="mt-8 p-6 bg-white rounded-lg text-red-500">
          Error loading products. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Headline title="Products" />
      <section className="mt-3 sm:mt-8">
        <Button
          rightSection={<PlusIcon />}
          variant="default"
          className="border-none bg-primary  border-s-e rounded-ee-xl  text-white text-sm font-medium px-[14px]  hover:bg-opacity-90 transition-all ease-in-out duration-300"
          component={Link}
          to="/add-product"
        >
          Add new product
        </Button>
        <Filter isProductsPage setFilters={setFilters} />
        {isLoading ? (
          <div className="mt-5 p-6 bg-white rounded-lg flex justify-center">
            <Loader size="md" />
          </div>
        ) : (
          <ProductsTable data={data?.data as Product[]} filters={filters} />
        )}
      </section>
    </div>
  )
}
