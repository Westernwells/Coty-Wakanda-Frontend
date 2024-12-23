import { Button, Grid, Group, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { FormSection } from "../Shared/Form/Section";
import DateIcon from "../Icons/DateIcon";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormField } from "../Shared/Form/Field";
import { PlusIcon } from "lucide-react";
import RefreshIcon from "../Icons/RefreshIcon";
import ExitIcon from "../Icons/ExitIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { useDisclosure } from "@mantine/hooks";
import { selectStyles, textInputStyles } from "../Shared/Styles";

const AddOfferingForm = () => {
  const form = useForm({
    initialValues: {
      launch_id: "",
      offering_number: "",
      deadline: "",
      global_icw: "",
      global_ocd: "",
      type: "",
      offering_deck: "",
      sfm_deck: "",
    },
  });

  const ircForm = useForm({
    initialValues: {
      irc_number: "",
      icp_cost: "",
      currency: "",
    },
  });

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => {
          console.log("submitted");
          console.log(values);
        })}
      >
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
              {...form.getInputProps("launch_id")}
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
                {...form.getInputProps("offering_number")}
                placeholder="00"
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
                {...form.getInputProps("deadline")}
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
              <TextInput
                {...form.getInputProps("global_icw")}
                placeholder="00 Mar 2024"
                label="Global ICW"
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
                {...form.getInputProps("global_ocd")}
                placeholder="Global OCD"
                label="Global OCD"
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
                {...form.getInputProps("type")}
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
                id="offering_deck"
                multiple={true}
                accept="application/vnd.ms-powerpoint"
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
                id="sfm_deck"
                multiple={true}
                accept="application/vnd.ms-powerpoint"
              />
            </Grid.Col>
          </Grid>
        </FormSection>
        <Group justify="flex-start" mt="md">
          <FormField label="Add IRC (Products)">
            <Button
              variant="outline"
              className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              leftSection={<PlusIcon size={24} />}
              onClick={open}
            >
              Add IRC
            </Button>
          </FormField>
        </Group>
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
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
                  {...ircForm.getInputProps("irc_number")}
                  label="IRC Number"
                  placeholder="123123124124"
                  type="text"
                  classNames={textInputStyles}
                />
                <TextInput
                  {...ircForm.getInputProps("icp_cost")}
                  label="ICP Cost"
                  placeholder="23"
                  type="text"
                  classNames={textInputStyles}
                />
                <Select
                  {...ircForm.getInputProps("currency")}
                  label="Pref/non-pref"
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
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    // disabled={addCoefficientMutations.isPending}
                    onClick={() => {
                      console.log(ircForm.getValues());
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
