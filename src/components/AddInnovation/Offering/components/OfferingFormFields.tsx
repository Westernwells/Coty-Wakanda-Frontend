import React from "react";
import { Grid, TextInput, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import ChevronDownIcon from "../../../Icons/ChevronDownIcon";
import DateIcon from "../../../Icons/DateIcon";
import { textInputStyles, selectStyles } from "../../../Shared/Styles";
import { OfferingFormState } from "../types";

interface OfferingFormFieldsProps {
  offeringForm: OfferingFormState;
  setOfferingForm: React.Dispatch<React.SetStateAction<OfferingFormState>>;
  touchedFields: {
    number: boolean;
    type: boolean;
  };
  setTouchedFields: React.Dispatch<
    React.SetStateAction<{
      number: boolean;
      type: boolean;
    }>
  >;
  isSubmitted: boolean;
}

export const OfferingFormFields: React.FC<OfferingFormFieldsProps> = ({
  offeringForm,
  setOfferingForm,
  touchedFields,
  setTouchedFields,
  isSubmitted,
}) => {
  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <TextInput
          value={offeringForm.number}
          onChange={(e) => {
            setOfferingForm((prev) => ({
              ...prev,
              number: e.target.value,
            }));
            setTouchedFields((prev) => ({
              ...prev,
              number: true,
            }));
          }}
          placeholder="Offering Number"
          label="Offering number"
          classNames={textInputStyles}
          required
          error={
            (isSubmitted || touchedFields.number) &&
            offeringForm.number.trim() === ""
              ? "Offering number is required"
              : null
          }
        />
      </Grid.Col>
      {/* <Grid.Col span={{ sm: 6, base: 12 }}>
        <DateInput
          value={offeringForm.deadline}
          onChange={(date) =>
            setOfferingForm((prev) => ({
              ...prev,
              deadline: date || new Date(),
            }))
          }
          label="Forecast deadline"
          valueFormat="YYYY MMM DD"
          placeholder="Select date"
          rightSection={<DateIcon />}
          classNames={textInputStyles}
        />
      </Grid.Col> */}
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <DateInput
          value={offeringForm.icw}
          onChange={(date) =>
            setOfferingForm((prev) => ({
              ...prev,
              icw: date || new Date(),
            }))
          }
          label="Global ICW"
          valueFormat="YYYY MMM DD"
          placeholder="Select date"
          rightSection={<DateIcon />}
          classNames={textInputStyles}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <DateInput
          value={offeringForm.ocd}
          onChange={(date) =>
            setOfferingForm((prev) => ({
              ...prev,
              ocd: date || new Date(),
            }))
          }
          label="Global OCD"
          valueFormat="YYYY MMM DD"
          placeholder="Select date"
          rightSection={<DateIcon />}
          classNames={textInputStyles}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          value={offeringForm.type}
          onChange={(value) => {
            setOfferingForm((prev) => ({
              ...prev,
              type: value || "",
            }));
            setTouchedFields((prev) => ({
              ...prev,
              type: true,
            }));
          }}
          label="Type"
          placeholder="Select type"
          data={[
            { value: "saleable", label: "Saleable" },
            { value: "non saleable", label: "Non Saleable" },
          ]}
          rightSection={<ChevronDownIcon />}
          classNames={selectStyles}
          required
          error={
            (isSubmitted || touchedFields.type) &&
            offeringForm.type === ""
              ? "Type is required"
              : null
          }
          clearable
        />
      </Grid.Col>
    </Grid>
  );
};

export default OfferingFormFields;
