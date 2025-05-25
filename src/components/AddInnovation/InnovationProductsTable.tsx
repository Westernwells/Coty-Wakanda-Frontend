import { useUserStore } from "@/stores/userStore";
import { Product } from "@/types";
import { Loader, NumberInput, Table, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EyeIcon from "../Icons/EyeIcon";
import PencilIcon from "../Icons/PencilIcon";
import { CustomSelect } from "../HomePage/CustomSelect";

interface InnovationProductsTableProps {
  products: Product[];
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  onProductSelect?: (product: Product) => void;
  brandOptions: { value: string; label: string }[];
  brandPillarOptions: { value: string; label: string }[];
  onBulkUpdate?: (products: Product[]) => void;
}

function InnovationProductsTable({
  products,
  isEdit,
  setIsEdit,
  onProductSelect,
  brandOptions,
  brandPillarOptions,
  onBulkUpdate,
}: InnovationProductsTableProps) {
  const role = useUserStore((state) => state.user)?.role;
  const [currentProducts, setCurrentProducts] = useState<Product[]>(products);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkUpdateSuccess, setIsBulkUpdateSuccess] = useState(false);
  const [isBulkUpdateError, setIsBulkUpdateError] = useState(false);
  const [bulkUpdateError, setBulkUpdateError] = useState<string | null>(null);

  const initialValues = currentProducts.map((product) => ({
    product_id: product.id,
    icp_eur: product.icp_eur,
    icp_usd: product.icp_usd,
    brand_id: product.brand.id.toString(),
    brand_type: product.brand.type,
    brand_pillar_id: product.brand_pillar?.id || "",
    sub_brand_id: product.subcategory?.id || "",
    material_description: product.material_description ?? "",
    irc: product.irc ?? "",
  }));

  const form = useForm({
    initialValues: {
      products: initialValues,
    },
  });

  // Track edited fields as a set of keys like "products.2.icp_eur"
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const initialValuesRef = useRef(initialValues);

  function handleNumberInputChange(path: string, value: number | "") {
    form.setFieldValue(path, value);
    const parts = path.split(".");
    const idx = Number(parts[1]);
    const field = parts[2] as "icp_eur" | "icp_usd";
    const initial = initialValuesRef.current?.[idx]?.[field];
    const valueStr = value === "" ? "" : String(value);
    if (valueStr !== initial) {
      setEditedFields((prev) => new Set(prev).add(path));
    } else {
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }

  function handleTextInputChange(path: string, value: string) {
    form.setFieldValue(path, value);
    const parts = path.split(".");
    const idx = Number(parts[1]);
    const field = parts[2] as "material_description" | "irc";
    const initial = initialValuesRef.current?.[idx]?.[field];
    if (value !== initial) {
      setEditedFields((prev) => new Set(prev).add(path));
    } else {
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }

  useEffect(() => {
    setCurrentProducts(products);
    form.reset();
  }, [products]);

  function getChangedProducts() {
    const changedIndices = Array.from(editedFields)
      .map((path) => Number(path.split(".")[1]))
      .filter((v, i, a) => a.indexOf(v) === i);

    const changedProducts = changedIndices.map((idx) => {
      const original = currentProducts[idx];
      const edited = form.values.products[idx];

      return {
        product_id: Number(edited.product_id),
        brand_id: Number(edited.brand_id),
        sub_brand_id: edited.sub_brand_id
          ? Number(edited.sub_brand_id)
          : undefined,
        division: original.division,
        material_description: edited.material_description,
        irc: edited.irc,
        icp_eur: edited.icp_eur !== "" ? String(edited.icp_eur) : undefined,
        icp_usd: edited.icp_usd !== "" ? String(edited.icp_usd) : undefined,
      };
    });

    return changedProducts;
  }

  if (!products.length) {
    return <p>No products available</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg mt-5">
      <div className="relative border border-primary rounded-xl border-t-0">
        <InfiniteScroll
          dataLength={currentProducts.length}
          next={() => {}}
          hasMore={false}
          loader={
            <div className="text-center py-4">
              <Loader size="md" />
            </div>
          }
        >
          <Table.ScrollContainer minWidth={768}>
            <Table
              verticalSpacing="sm"
              borderColor="transparent"
              striped="even"
              stripedColor="#F2F4F6"
            >
              <Table.Thead>
                <Table.Tr className="bg-primary text-white">
                  <Table.Th className="rounded-ss-xl">Brand</Table.Th>
                  <Table.Th>Brand Type</Table.Th>
                  <Table.Th>Brand Pillar</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>IRC</Table.Th>
                  <Table.Th>ICP EU</Table.Th>
                  <Table.Th>ICP USD</Table.Th>
                  <Table.Th>Pref Value</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th className="rounded-se-xl"></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {currentProducts.map((product, index) => (
                  <Table.Tr
                    key={product.id}
                    onClick={() => onProductSelect?.(product)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Table.Td className="first:rounded-es-xl">
                      {isEdit ? (
                        brandOptions.length > 0 ? (
                          <CustomSelect
                            value={String(
                              form.values.products[index].brand_id ?? ""
                            )}
                            options={brandOptions}
                            onChange={(val) => {
                              form.setFieldValue(
                                `products.${index}.brand_id`,
                                val
                              );
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add(`products.${index}.brand_id`);
                                return next;
                              });
                            }}
                            isChanged={editedFields.has(
                              `products.${index}.brand_id`
                            )}
                          />
                        ) : (
                          <div className="w-full h-10 bg-gray-100 rounded animate-pulse" />
                        )
                      ) : (
                        product.brand.name
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <CustomSelect
                          value={String(
                            form.values.products[index].brand_type ?? ""
                          )}
                          options={[
                            { value: "Mass", label: "Mass" },
                            { value: "Luxury", label: "Luxury" },
                          ]}
                          onChange={(val) => {
                            form.setFieldValue(
                              `products.${index}.brand_type`,
                              val
                            );
                            setEditedFields((prev) => {
                              const next = new Set(prev);
                              next.add(`products.${index}.brand_type`);
                              return next;
                            });
                          }}
                          isChanged={editedFields.has(
                            `products.${index}.brand_type`
                          )}
                        />
                      ) : (
                        product.brand.type
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        brandPillarOptions.length > 0 ? (
                          <CustomSelect
                            value={String(
                              form.values.products[index].brand_pillar_id ?? ""
                            )}
                            options={brandPillarOptions}
                            onChange={(val) => {
                              form.setFieldValue(
                                `products.${index}.brand_pillar_id`,
                                val
                              );
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add(`products.${index}.brand_pillar_id`);
                                return next;
                              });
                            }}
                            isChanged={editedFields.has(
                              `products.${index}.brand_pillar_id`
                            )}
                          />
                        ) : (
                          <div className="w-full h-10 bg-gray-100 rounded animate-pulse" />
                        )
                      ) : (
                        product.brand_pillar?.name || "-"
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <TextInput
                          {...form.getInputProps(
                            `products.${index}.material_description`
                          )}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.material_description`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                          onChange={(e) =>
                            handleTextInputChange(
                              `products.${index}.material_description`,
                              e.currentTarget.value
                            )
                          }
                          value={
                            form.values.products[index].material_description
                          }
                          data-testid="material-description-input"
                        />
                      ) : (
                        product.material_description
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <TextInput
                          {...form.getInputProps(`products.${index}.irc`)}
                          styles={{
                            input: {
                              border: editedFields.has(`products.${index}.irc`)
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                          onChange={(e) =>
                            handleTextInputChange(
                              `products.${index}.irc`,
                              e.currentTarget.value
                            )
                          }
                          value={form.values.products[index].irc}
                          data-testid="irc-input"
                        />
                      ) : (
                        product.irc
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <NumberInput
                          {...form.getInputProps(`products.${index}.icp_eur`)}
                          hideControls
                          allowNegative={false}
                          onChange={(value) => {
                            if (typeof value === "number" || value === "") {
                              handleNumberInputChange(
                                `products.${index}.icp_eur`,
                                value
                              );
                            }
                          }}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.icp_eur`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                        />
                      ) : (
                        product.icp_eur
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <NumberInput
                          {...form.getInputProps(`products.${index}.icp_usd`)}
                          hideControls
                          allowNegative={false}
                          onChange={(value) => {
                            if (typeof value === "number" || value === "") {
                              handleNumberInputChange(
                                `products.${index}.icp_usd`,
                                value
                              );
                            }
                          }}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.icp_usd`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                        />
                      ) : (
                        product.icp_usd
                      )}
                    </Table.Td>
                    <Table.Td>
                      <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                        {product.pref}
                      </span>
                    </Table.Td>

                    <Table.Td>
                      {product.status ? (
                        <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                          {product.status}
                        </span>
                      ) : null}
                    </Table.Td>
                    {/* <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                      {role === "admin" ? <PencilIcon /> : <EyeIcon />}
                    </Table.Td> */}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </InfiniteScroll>
        {isEdit && (
          <div className="fixed left-1/2 bottom-3 z-10 pl-40 -translate-x-1/2">
            <div className="flex items-center bg-primary rounded-2xl px-8 py-3 shadow-lg w-max">
              <button
                type="button"
                className="text-white text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl"
                onClick={() => {
                  setIsEdit(false);
                  setEditedFields(new Set());
                  form.reset();
                }}
              >
                Cancel editing
              </button>
              <div className="h-6 w-px bg-gray-500 mx-4" />
              <button
                type="submit"
                className="text-white text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl disabled:opacity-60"
                disabled={isBulkUpdating}
                onClick={() => {
                  const changed = getChangedProducts();
                  if (onBulkUpdate) {
                    setIsBulkUpdating(true);
                    try {
                      onBulkUpdate(changed as unknown as Product[]);
                      setIsBulkUpdateSuccess(true);
                      setIsEdit(false);
                    } catch (error) {
                      setIsBulkUpdateError(true);
                      setBulkUpdateError((error as Error).message);
                    } finally {
                      setIsBulkUpdating(false);
                    }
                  }
                }}
              >
                {isBulkUpdating ? "Saving..." : "Save & done edit"}
              </button>
            </div>
          </div>
        )}
        {isBulkUpdateError && (
          <div className="text-red-500 text-sm mt-2">
            {bulkUpdateError || "Failed to update products."}
          </div>
        )}
        {isBulkUpdateSuccess && (
          <div className="text-green-600 text-sm mt-2">
            Products updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}

export default InnovationProductsTable;
