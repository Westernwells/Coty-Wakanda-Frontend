import { Product } from "@/types";
import {
  Button,
  Grid,
  Group,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import ExitIcon from "../Icons/ExitIcon";
import PencilIcon from "../Icons/PencilIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import TrashIcon from "../Icons/TrashIcon";
import EditInnovationProductForm from "../InnovationProduct/Form";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { InnovationProductsTable } from "./InnovationProductsTable";
import { getProducts } from "@/api/products/get-products";
import { useQuery } from "@tanstack/react-query";

const AddOfferingForm = ({
  setOfferingOpen,
  offeringIndex,
  form,
}: {
  setOfferingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  offeringIndex: number;
  form: UseFormReturnType<{
    brand_id: string;
    sub_brand_id: string;
    year: Date;
    format: string;
    launch_name: string;
    other_name: string;
    document: string;
    forecast_deadline: Date;
    offerings?: {
      number: string;
      icw: Date;
      ocd: Date;
      type: string;
      deck: string;
      market_deck: string;
      products: Array<
        Partial<Product> & {
          currency: string;
        }
      >;
    }[];
  }>;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [productOpen, setProductOpen] = useState(-1);
  const [isEdit, setIsEdit] = useState(false);

  const idx =
    offeringIndex !== -1
      ? offeringIndex
      : (form?.getValues()?.offerings?.length ?? 1) - 1;
  const productIdx =
    (form?.getValues()?.offerings?.[idx].products.length ?? 1) - 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", {}],
    queryFn: () =>
      getProducts({
        cursor: 1,
        page_size: 20,
        filter: {
          search: "",
          region_id: "",
          market_id: "",
          brand_id: "",
          sub_brand_id: "",
          distributor_id: "",
          division: "",
        },
      }),
  });

  if (productOpen >= 0) {
    return (
      <EditInnovationProductForm
        path={`offerings.${idx}.products.${productOpen}`}
        setProductOpen={setProductOpen}
        form={form}
      />
    );
  }

  return (
    <>
      <Grid
        gutter={{
          sm: 32,
          base: 16,
        }}
      >
        <Grid.Col
          span={{
            sm: 6,
            base: 12,
          }}
        >
          <TextInput
            {...form.getInputProps(`offerings.${idx}.launch_id`)}
            placeholder="Launch ID"
            classNames={textInputStyles}
          />
        </Grid.Col>
      </Grid>
      <FormSection title="General Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps(`offerings.${idx}.number`)}
              placeholder="Offering Number"
              label="Offering number"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <DateInput
              {...form.getInputProps(`offerings.${idx}.deadline`)}
              label="Forecast deadline"
              valueFormat="YYYY MMM DD"
              placeholder="Select date"
              rightSection={<DateIcon />}
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 12,
            }}
          >
            <DateInput
              {...form.getInputProps(`offerings.${idx}.icw`)}
              label="Global ICW"
              valueFormat="YYYY MMM DD"
              placeholder="Select date"
              rightSection={<DateIcon />}
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 12,
            }}
          >
            <DateInput
              {...form.getInputProps(`offerings.${idx}.ocd`)}
              label="Global OCD"
              valueFormat="YYYY MMM DD"
              placeholder="Select date"
              rightSection={<DateIcon />}
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 4,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps(`offerings.${idx}.type`)}
              placeholder="Type"
              label="Type"
              classNames={textInputStyles}
            />
          </Grid.Col>
        </Grid>
      </FormSection>
      <FormSection title="Custom Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              lg: 6,
              base: 12,
            }}
          >
            <FileUploadSection
              label="Upload offering deck"
              form={form}
              id={`offerings.${idx}.deck`}
              multiple={false}
              accept="application/vnd.ms-powerpoint"
              stringOnly
            />
          </Grid.Col>
          <Grid.Col
            span={{
              lg: 6,
              base: 12,
            }}
          >
            <FileUploadSection
              label="Upload safe for market offering deck "
              form={form}
              id={`offerings.${idx}.market_deck`}
              multiple={false}
              accept="application/vnd.ms-powerpoint"
              stringOnly
            />
          </Grid.Col>
        </Grid>
      </FormSection>
      <Grid justify="flex-start" mt="md">
        {
          <Grid.Col span={12}>
            <InnovationProductsTable
              products={data?.data ?? []}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              onBulkSave={() => {}}
            />
          </Grid.Col>
        }
        <Grid.Col
          span={{
            lg: 6,
            base: 12,
          }}
        >
          <FormField label="Add IRC (Products)">
            <Button
              variant="outline"
              className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              leftSection={<PlusIcon size={24} />}
              onClick={() => {
                form.insertListItem(`offerings.${idx}.products`, {
                  irc: "",
                  currency: "",
                  price: "",
                });
                open();
              }}
            >
              Add IRC
            </Button>
          </FormField>
        </Grid.Col>
      </Grid>
      <Group justify="flex-end" mt="md">
        <Button
          type="submit"
          onClick={() => {
            const errors = Object.keys(form.validate().errors).some((key) =>
              key.includes(`offerings.${idx}`)
            );
            if (!errors) {
              setOfferingOpen(false);
            }
          }}
        >
          Submit
        </Button>
      </Group>
      <Modal.Root
        opened={opened}
        onClose={close}
        withinPortal={false}
        trapFocus={false}
        className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Add IRC
              </h2>
              <div className="space-y-6">
                <TextInput
                  {...form.getInputProps(
                    `offerings.${idx}.products.${productIdx}.irc`
                  )}
                  label="IRC Number"
                  placeholder="123123124124"
                  type="text"
                  classNames={textInputStyles}
                />
                <TextInput
                  {...form.getInputProps(
                    `offerings.${idx}.products.${productIdx}.price`
                  )}
                  label="ICP Cost"
                  placeholder="23"
                  type="text"
                  classNames={textInputStyles}
                />
                <Select
                  {...form.getInputProps(
                    `offerings.${idx}.products.${productIdx}.currency`
                  )}
                  label="Currency"
                  placeholder="USD"
                  data={[
                    { value: "usd", label: "USD" },
                    { value: "eur", label: "Euro" },
                  ]}
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                />
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={() => {
                      form.removeListItem(
                        `offerings.${idx}.products`,
                        productIdx
                      );
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={() => {
                      close();
                    }}
                  >
                    Add
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default AddOfferingForm;
