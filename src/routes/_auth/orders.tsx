import OrdersTable from '@/components/Distributor-forcasts/OrdersTable';
import DeadlineHeader from '@/components/DistributorPages/Shared/DeadlineHeader';
import SubmitFooter from '@/components/DistributorPages/Shared/SubmitFooter';
import Headline from '@/components/Shared/Headline';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/orders')({
  component: RouteComponent,
})


function RouteComponent() {
  return (
    <div>
      <Headline title="Orders" />
      <DeadlineHeader title="Order Deadline" />
      <OrdersTable />
      <SubmitFooter title="Submit Orders"/>
    </div>
  );
}
