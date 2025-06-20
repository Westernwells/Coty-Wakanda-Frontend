import { Grid, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ForecastData } from "@/types";
import ChevronDownIcon from "../../Icons/ChevronDownIcon";
import DateIcon from "../../Icons/DateIcon";
import DateChanger from "../../Shared/DateChanger";

interface ForecastFiltersProps {
  sortBy: string | null;
  setSortBy: (value: string | null) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  showDateChanger: boolean;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const ForecastFilters = ({ 
  sortBy, 
  setSortBy, 
  itemsPerPage, 
  setItemsPerPage, 
  showDateChanger, 
  date, 
  setDate 
}: ForecastFiltersProps) => (
  <Grid justify="space-between" className="mb-4">
    <Grid.Col
      span={{
        base: 12,
        md: 8,
        lg: 9,
      }}
      className="flex gap-4"
    >
      <DateInput
        aria-label="Start Date"
        placeholder="Start Date"
        clearable
        variant="filled"
        className="grow"
        rightSection={<DateIcon />}
      />
      <DateInput
        aria-label="End Date"
        placeholder="End Date"
        clearable
        variant="filled"
        className="grow"
        rightSection={<DateIcon />}
      />
      <Select
        aria-label="Sort by"
        placeholder="Sort by"
        data={[
          { value: "product.brand.name", label: "Brand" },
          { value: "product.offering_number", label: "Offering Number" },
          { value: "cost", label: "cost" },
        ]}
        value={sortBy}
        onChange={(v) => setSortBy(v as keyof ForecastData)}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
      <Select
        aria-label="Show 100"
        placeholder="Show 100"
        data={[
          { value: "5", label: "Show 5" },
          { value: "10", label: "Show 10" },
          { value: "50", label: "Show 50" },
          { value: "100", label: "Show 100" },
        ]}
        value={itemsPerPage}
        onChange={(v) => v && setItemsPerPage(v)}
        clearable
        className="grow"
        rightSection={<ChevronDownIcon />}
      />
    </Grid.Col>
    {showDateChanger && (
      <Grid.Col
        className="md:justify-end justify-center items-center flex"
        span={{
          base: 12,
          md: 4,
          lg: 3,
        }}
      >
        <DateChanger date={date} setDate={setDate} />
      </Grid.Col>
    )}
  </Grid>
); 