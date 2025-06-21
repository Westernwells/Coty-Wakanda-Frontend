import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import {  useNavigate } from "@tanstack/react-router";
import { ForecastItem } from "@/api/forecasts/get-forcasts";

export const useForecastTableColumns = (columnHeaders: string[]): ColumnDef<ForecastItem>[] => {
  const navigate = useNavigate();

  return [
    {
      header: "Brand",
      accessorFn: (row) => row.product.brand.name,
      meta: {
        cellClassName: "text-sm text-[#333]",
        headerClassName: "font-semibold",
      },
    },
    {
      header: "Brand Pillar",
      accessorFn: (row) => row.product.brand_pillar.name,
    },
    {
      header: "SKU",
      accessorKey: "product.sku",
    },
    {
      header: "Launch ID",
      accessorFn: (row) => row.product.launch_id ?? "—",
    },
    {
      header: "Distributor",
      accessorFn: (row) => row.distributor?.name ?? "—",
    },
    {
      header: "Offering Number",
      accessorFn: (row) => row.product.offering_number ?? "—",
    },
    ...columnHeaders.map((month) => ({
      header: month,
      id: month,
      accessorFn: (row: any) => row.items?.[month]?.value ?? 0,
      meta: {
        cellClassName: "text-center text-xs",
        headerClassName: "text-xs text-gray-600 text-center",
      },
    })),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="cursor-pointer"
          onClick={() =>
            navigate({
              to: `/forecast-details/$productId`,
              params: { productId: row.original.product.id.toString() },
            })
          }
        >
          <EyeIcon size={16} />
        </div>
      )
      
    },
  ];
};