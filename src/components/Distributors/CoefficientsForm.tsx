import { useAddCoefficient } from "@/api/coefficients/create-coeff";
import { useUpdateCoefficient } from "@/api/coefficients/update-coeff";
import { Coefficient } from "@/types";
import { Button, Group, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { useQueryClient } from "@tanstack/react-query";

interface CoefficientsFormProps {
  opened: boolean;
  close: () => void;
  distributorId: number;
  data?: Coefficient | null;
  onSuccess?: () => void;
}

export function CoefficientsForm({
  opened,
  close,
  distributorId,
  data,
  onSuccess,
}: CoefficientsFormProps) {
  const isEdit = !!data;
  const coeffForm = useForm<{
    type: "regular" | "giftset" | "tester";
    pref_value: string;
    non_pref_value: string;
  }>({
    initialValues: {
      type: data?.type || "regular",
      pref_value: data?.pref_value || "",
      non_pref_value: data?.non_pref_value || "",
    },
  });

  useEffect(() => {
    if (data) {
      coeffForm.setValues({
        type: data.type,
        pref_value: data.pref_value,
        non_pref_value: data.non_pref_value,
      });
    } else {
      coeffForm.setValues({
        type: "regular",
        pref_value: "",
        non_pref_value: "",
      });
    }
  }, [data]);

  const queryClient = useQueryClient();

  const { mutate: addMutate, isPending: isAddPending } = useAddCoefficient({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["coefficients", distributorId],
        });
        close();
        onSuccess?.();
      },
    },
  });

  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdateCoefficient({
      mutationConfig: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["coefficients", distributorId],
          });
          close();
          onSuccess?.();
        },
      },
    });

  function handleSubmit(values: {
    type: "regular" | "giftset" | "tester";
    pref_value: string;
    non_pref_value: string;
  }) {
    if (isEdit && data) {
      updateMutate({
        data: {
          type: values.type,
          pref_value: values.pref_value,
          non_pref_value: values.non_pref_value,
          brand_id: String(data.brand.id),
          category_id: String(data.category.id),
          description: data.description || "",
        },
        distributorId,
        coeffId: data.id,
      });
    } else {
      addMutate({ data: values, distributorId });
    }
  }

  return (
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
              {isEdit ? "Edit Co-efficient" : "Add Co-efficient"}
            </h2>
            <div className="space-y-6">
              <Select
                {...coeffForm.getInputProps("type")}
                label="Type"
                placeholder="Select type"
                data={[
                  { value: "regular", label: "Regular" },
                  { value: "giftset", label: "Giftset" },
                  { value: "tester", label: "Tester" },
                ]}
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
              <TextInput
                {...coeffForm.getInputProps("pref_value")}
                label="Pref value"
                placeholder="Pref value"
                type="text"
                classNames={textInputStyles}
              />
              {coeffForm.values.type === "regular" && (
                <TextInput
                  {...coeffForm.getInputProps("non_pref_value")}
                  label="Non-pref value"
                  placeholder="Non-pref value"
                  type="text"
                  classNames={textInputStyles}
                />
              )}
              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  leftSection={<ExitIcon />}
                  onClick={close}
                  disabled={isAddPending || isUpdatePending}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px]   hover:bg-primary/90 transition-all ease-in-out duration-300"
                  loading={isAddPending || isUpdatePending}
                  onClick={() => handleSubmit(coeffForm.getValues())}
                >
                  {isEdit ? "Update" : "Add"}
                </Button>
              </Group>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CoefficientsForm;
