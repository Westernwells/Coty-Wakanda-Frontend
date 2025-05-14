import {
  addCoefficientInput,
  useAddCoefficient,
} from "@/api/coefficients/create-coeff";
import { useUpdateCoefficient } from "@/api/coefficients/update-coeff";
import { Brand, getBrands } from "@/api/get-brands";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { Coefficient } from "@/types";
import {
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import {
  selectStyles,
  textAreaStyles,
  textInputStyles,
} from "../Shared/Styles";
import { FormValues } from "./AddDistributorForm";

function CoefficientsForm({
  opened,
  close,
  data,
  distributorId,
  form,
}: {
  opened: boolean;
  close: () => void;
  data?: Coefficient | null;
  distributorId?: number;
  form?: UseFormReturnType<FormValues>;
}) {
  const [{ data: categoriesData }, { data: brandsData }] = useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: () => getCategories({ page_size: 999999 }),
      },
      { queryKey: ["brands"], queryFn: () => getBrands() },
    ],
  });
  const updateCoefficientMutations = useUpdateCoefficient({
    mutationConfig: {
      onSuccess: () => {
        close();
      },
    },
  });
  const addCoefficientMutations = useAddCoefficient({
    mutationConfig: {
      onSuccess: () => {
        close();
      },
    },
  });

  const coeffForm = useForm<addCoefficientInput>({
    initialValues: {
      value: "",
      pref: "pref",
      brand_id: "",
      category_id: "",
      description: "",
    },
  });

  useEffect(() => {
    if (data) {
      coeffForm.setValues({
        ...data,
        brand_id: data.brand.id.toString(),
        category_id: data.category.id.toString(),
      });
    }
  }, [data]);

  const handleSubmit = (values: addCoefficientInput) => {
    if (!distributorId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...data } = values;
      form?.insertListItem("coefficients", data);
      close();
      return;
    }
    if (data) {
      updateCoefficientMutations.mutate({
        data: values,
        distributorId: distributorId || 0,
        coeffId: data.id,
      });
      return;
    }
    addCoefficientMutations.mutate({
      data: values,
      distributorId: distributorId || 0,
    });
    close();
  };
  return (
    <div>
      {addCoefficientMutations.isPending ||
      updateCoefficientMutations.isPending ? (
        <Loader />
      ) : (
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
                  Add Co-efficient
                </h2>
                <div className="space-y-6">
                  <TextInput
                    {...coeffForm.getInputProps("value")}
                    label="Co-efficient value"
                    placeholder="Co-efficient value"
                    type="text"
                    classNames={textInputStyles}
                  />
                  <Select
                    {...coeffForm.getInputProps("pref")}
                    label="Pref/non-pref"
                    placeholder="Select pref/non-pref"
                    data={[
                      { value: "pref", label: "Pref" },
                      { value: "non-pref", label: "Non-pref" },
                    ]}
                    rightSection={<ChevronDownIcon />}
                    classNames={selectStyles}
                    clearable
                    searchable
                  />
                  <Select
                    {...coeffForm.getInputProps("brand_id")}
                    label="Brand"
                    placeholder="Select brand"
                    data={
                      brandsData?.data?.map((brand: Brand) => ({
                        value: brand?.id.toString(),
                        label: brand?.name,
                      })) || []
                    }
                    rightSection={<ChevronDownIcon />}
                    classNames={selectStyles}
                    clearable
                    searchable
                  />
                  <Select
                    {...coeffForm.getInputProps("category_id")}
                    label="Category"
                    placeholder="Select category"
                    data={
                      categoriesData?.data?.map((category) => ({
                        value: category.id.toString(),
                        label: category.name,
                      })) || []
                    }
                    rightSection={<ChevronDownIcon />}
                    classNames={selectStyles}
                    clearable
                    searchable
                  />
                  <Textarea
                    {...coeffForm.getInputProps("description")}
                    label="Description"
                    placeholder="Add your text here"
                    classNames={textAreaStyles}
                    autosize
                    minRows={3}
                  />
                  <Group justify="flex-end" mt="xl" gap={10}>
                    <Button
                      variant="outline"
                      className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                      leftSection={<ExitIcon />}
                      onClick={close}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<RefreshIcon />}
                      variant="outline"
                      className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px]   hover:bg-primary/90 transition-all ease-in-out duration-300"
                      disabled={
                        addCoefficientMutations.isPending ||
                        updateCoefficientMutations.isPending
                      }
                      onClick={() => {
                        const data = coeffForm.getValues();
                        handleSubmit(data);
                      }}
                    >
                      {data ? "Update" : "Add"}
                    </Button>
                  </Group>
                </div>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      )}
    </div>
  );
}

export default CoefficientsForm;
