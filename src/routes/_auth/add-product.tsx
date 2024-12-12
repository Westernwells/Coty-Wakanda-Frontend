import AddProductForm from '@/components/AddProduct/Form'
import ChevronDownIcon from '@/components/Icons/ChevronDownIcon'
import Headline from '@/components/Shared/Headline'
import { Button } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/add-product')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full">
      <Headline title="Add product" />
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
          to=".."
        >
          Back to Product
        </Button>
      </section>
      <AddProductForm />
    </div>
  )
}
