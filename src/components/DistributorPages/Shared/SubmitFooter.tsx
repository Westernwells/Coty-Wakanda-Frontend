import { Button, Group } from "@mantine/core";
import FileDownloadIcon from "../../Icons/FileDownloadIcon";
import PlusIcon from "../../Icons/PlusIcon";
import SubmitModal from "../../Distributor-forcasts/SubmitModal";
import { useDisclosure } from "@mantine/hooks";
import { UseFormReturnType } from "@mantine/form";
import { useSubmitForecast } from "@/api/forecasts/submit-forcast";
import { ForecastSubmitInput } from "@/types";

const SubmitFooter = ({
  title,
  form,
}: {
  title: string;
  form?: UseFormReturnType<
    ForecastSubmitInput[],
    (values: ForecastSubmitInput[]) => ForecastSubmitInput[]
  >;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const submitForecastMutation = useSubmitForecast({ mutationConfig: {} });
  const onSubmit = () => {
    if (form) {
      const data = form.getValues();
      submitForecastMutation.mutate({ data: { forecast: data }, type: "save" });
    }
  };
  return (
    <Group justify="flex-end" mt="xl" gap={10}>
      <Button
        variant="outline"
        className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
        leftSection={<FileDownloadIcon />}
        onClick={() => {}}
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
        onSubmit={onSubmit}
      />
    </Group>
  );
};

export default SubmitFooter;
