import { Table, NumberInput, TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Product, Brand, Category } from "@/types";
import { CustomSelect } from "../HomePage/CustomSelect";
import { PriceBenchmarkModal } from "@/components/AddProduct/PriceBenchmarkModal";

interface InnovationProductsTableProps {
  products: Product[];
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  onBulkSave: (changed: { products: Partial<Product>[] }) => void;
  onOpenBenchmarkModal?: (product: Product) => void;
}

export const InnovationProductsTable = forwardRef(
  function InnovationProductsTable(
    {
      products,
      isEdit,
      setIsEdit,
      onBulkSave,
      onOpenBenchmarkModal,
    }: InnovationProductsTableProps,
    ref
  ) {
    const initialValues = products.map((product) => ({
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

    // Dummy options for selects (since no API fetch)
    const brandOptions = products.map((p) => ({
      value: p.brand.id.toString(),
      label: p.brand.name,
    }));
    const brandPillarOptions = products
      .map((p) =>
        p.brand_pillar
          ? {
              value: p.brand_pillar.id.toString(),
              label: p.brand_pillar.name || "-",
            }
          : null
      )
      .filter(Boolean) as { value: string; label: string }[];

    // Add modal state and selected product
    const [isBenchmarkModalOpen, setBenchmarkModalOpen] = useState(false);

    // Dummy data for brands, products, categories, and form
    // Replace with your actual data/fetching logic
    const brandsData: Brand[] = products.map((p) => p.brand);
    const productsListData: Product[] = products;
    const categoriesData: Category[] = products.map((p) => p.category);

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

    function getChangedProducts() {
      const changedIndices = Array.from(editedFields)
        .map((path) => Number(path.split(".")[1]))
        .filter((v, i, a) => a.indexOf(v) === i);

      const changedProducts = changedIndices.map((idx) => {
        const original = products[idx];
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
      return { products: changedProducts };
    }

    useImperativeHandle(ref, () => ({ getChangedProducts }), [
      editedFields,
      form.values.products,
    ]);

    function handleOpenBenchmarkModal() {
      setBenchmarkModalOpen(true);
    }

    function handleCloseBenchmarkModal() {
      setBenchmarkModalOpen(false);
    }

    function handleSaveBenchmark() {
      // Implement your save logic here
      setBenchmarkModalOpen(false);
    }

    if (!products.length) {
      return <p>No products available.</p>;
    }

    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-5">
        {!isEdit && (
          <Button
            className="border-none bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300 mb-6"
            onClick={() => setIsEdit(true)}
            variant="outline"
          >
            Edit Products
          </Button>
        )}
        <div className="relative border border-primary rounded-xl border-t-0">
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
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((product, index) => (
                  <Table.Tr key={product.id}>
                    <Table.Td className="first:rounded-es-xl">
                      {isEdit ? (
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
                      <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                        {product.product_type}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="default"
                        className="border-primary w-fit bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-3 hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                        onClick={() => {
                          if (onOpenBenchmarkModal)
                            onOpenBenchmarkModal(product);
                          else handleOpenBenchmarkModal();
                        }}
                      >
                        Set price benchmark
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {isEdit && (
            <div
              className="sticky left-1/2 z-10 -translate-x-1/2 flex items-center bg-primary rounded-2xl px-8 py-3  shadow-lg mt-4 mx-auto gap-4 w-full max-w-xl"
              style={{ position: "sticky", bottom: 30 }}
            >
              <Button
                type="button"
                className="flex-1 text-white text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl"
                onClick={() => setIsEdit(false)}
              >
                Cancel editing
              </Button>
              <div className="h-6 w-px bg-gray-500 mx-4" />
              <Button
                type="button"
                className="flex-1 text-black text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl disabled:opacity-60"
                onClick={() => onBulkSave(getChangedProducts())}
                disabled={editedFields.size === 0}
              >
                Save & done edit
              </Button>
            </div>
          )}
        </div>
        {/* Render the modal at the root */}
        <PriceBenchmarkModal
          opened={isBenchmarkModalOpen}
          onClose={handleCloseBenchmarkModal}
          onSave={handleSaveBenchmark}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form={form as any}
          brandsData={brandsData}
          productsListData={productsListData}
          categoriesData={categoriesData}
        />
      </div>
    );
  }
);
