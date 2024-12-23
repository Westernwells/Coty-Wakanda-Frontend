import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@mantine/core'
import Filter from '@/components/HomePage/Filter'
import Headline from '@/components/Shared/Headline'
import PlusIcon from '@/components/Icons/PlusIcon'
import ProductsTable from '@/components/HomePage/ProductsTable'
import { useState } from 'react'

export const Route = createFileRoute('/_auth/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    market: '',
  })
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
        <ProductsTable filters={filters}/>
      </section>
    </div>
  )
}
