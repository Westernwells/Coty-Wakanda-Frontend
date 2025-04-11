import { cn } from "@/lib/utils";
import { MasterProduct } from "@/types";
import React from "react";

interface ProductTableProps {
    products: MasterProduct[];
    selectedRow: string | null;
    setSelectedRow: React.Dispatch<React.SetStateAction<string | null>>;
    tableRef: React.RefObject<HTMLDivElement>;
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    selectedRow,
    setSelectedRow,
    tableRef,
    onScroll,
}) => {
    console.log("selected row", selectedRow);

    return (
        <div className="overflow-x-auto">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                    Product List
                </h2>
            </div>
            <div
                ref={tableRef}
                onScroll={onScroll}
                className="overflow-y-auto max-h-[calc(100vh-24rem)]"
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                House
                            </th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand Line
                            </th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Article Type
                            </th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IRC
                            </th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Group
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr
                                key={product.irc}
                                onClick={() => setSelectedRow(product.irc)}
                                className={cn(
                                    "cursor-pointer hover:bg-primary/10",
                                    selectedRow === product.irc &&
                                        "bg-primary/30"
                                )}
                            >
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.house}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.description}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.brand_line}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.article_type}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.irc}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                                    {product.group}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductTable;
