import {
    Checkbox,
    CloseButton,
    Divider,
    Group,
    Select,
    TextInput,
    Title,
} from "@mantine/core";
import { useField } from "@mantine/form";
import SearchIcon from "../Icons/SearchIcon";
import { twMerge } from "tailwind-merge";
import ChevronDownIcon from "../Icons/ChevronDownIcon";

const Filter = () => {
    const searchField = useField({
        initialValue: "",
    });
    return (
        <div className="bg-white w-full rounded-[20px] p-6 mt-5">
            <Title order={2} className="text-primary font-semibold text-xl">
                Refine your results
            </Title>
            <div className="flex items-center gap-x-5 mt-6">
                <TextInput
                    {...searchField.getInputProps()}
                    aria-label="Search"
                    placeholder="Search for..."
                    className=" w-full"
                    leftSection={<SearchIcon />}
                />

                <div
                    className={twMerge(
                        "flex items-center gap-x-2 cursor-pointer",
                        searchField.getValue().length === 0 && "invisible"
                    )}
                    onClick={() => {
                        searchField.setValue("");
                    }}
                >
                    <CloseButton />
                    <span className="text-nowrap text-primary font-medium">
                        Clear all
                    </span>
                </div>
            </div>
            <Divider className="my-6  border-primary border-opacity-50" />
            <Group gap={20} w="100%">
                <Select
                    aria-label="Filter brands"
                    placeholder="Filter brands"
                    data={["React", "Angular", "Vue", "Svelte"]}
                    clearable
                    className="grow"
                    rightSection={<ChevronDownIcon />}
                />
                <Select
                    aria-label="Filter brand pillars"
                    placeholder="Filter brand pillars"
                    data={["React", "Angular", "Vue", "Svelte"]}
                    clearable
                    className="grow"
                    rightSection={<ChevronDownIcon />}
                />
                <Select
                    aria-label="Filter distributors"
                    placeholder="Filter distributors"
                    data={["React", "Angular", "Vue", "Svelte"]}
                    clearable
                    className="grow"
                    rightSection={<ChevronDownIcon />}
                />
            </Group>

            <Group gap={24} w="100%" className="mt-6">
                <Checkbox label="All" size="xs" />
                <Checkbox label="Luxury only" size="xs" />
                <Checkbox label="Mass only" size="xs" />
            </Group>
        </div>
    );
};

export default Filter;
