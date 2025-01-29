import { Button, Group } from "@mantine/core";
import FileDownloadIcon from "../../Icons/FileDownloadIcon";
import PlusIcon from "../../Icons/PlusIcon";
import SubmitModal from "../../Distributor-forcasts/SubmitModal";
import { useDisclosure } from "@mantine/hooks";
import { UseFormReturnType } from "@mantine/form";
import { ForecastSubmitInput } from "@/types";
import { z } from "zod";
import { useSubmitOrder } from "@/api/orders/submit-order";

const SubmitFooter = ({
  title,
  form,
}: {
  title: string;
  form?: UseFormReturnType<
    {
      order: ForecastSubmitInput[];
    },
    (values: { order: ForecastSubmitInput[] }) => {
      order: ForecastSubmitInput[];
    }
  >;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const submitOrderMutation = useSubmitOrder({ mutationConfig: {} });
  const onSubmit = (type: "save" | "submit") => {
    if (form) {
      const data = form.getValues().order;
      console.log(data)
      const schema = z.object({
        items: z
          .object({ month: z.string(), value: z.number().min(0) })
          .array(),
        product_id: z.number()
      }).array();
      if(!schema.safeParse(data).success) {
        schema.safeParse(data).error?.issues.map((issue) => {
          const path = issue.path.join(".")
          form.setFieldError(`order.${path}`, "please fill this fields")
        })
        return
      }
      submitOrderMutation.mutate({ data: { order: data }, type: type });
    }
  };
  return (
    <Group justify="flex-end" mt="xl" gap={10}>
      <Button
        variant="outline"
        className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
        leftSection={<FileDownloadIcon />}
        onClick={() => onSubmit("save")}
      >
        Save
      </Button>
      <Button
        leftSection={<PlusIcon />}
        type="submit"
        variant="outline"
        className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
        onClick={() => open()}
      >
        Submit
      </Button>
      <SubmitModal
        opened={opened}
        close={close}
        title={title}
        onSubmit={() => onSubmit("submit")}
      />
    </Group>
  );
};

export default SubmitFooter;
