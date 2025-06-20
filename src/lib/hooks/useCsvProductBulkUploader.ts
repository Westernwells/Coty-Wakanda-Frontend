import { OfferingProductFormValues } from "@/components/AddInnovation/AddProductToOfferingModal";
import Papa from "papaparse";
import { useCallback } from "react";
import { toast } from "react-toastify";

type CsvToFormMap = {
  [header: string]: keyof OfferingProductFormValues;
};

// 1) Map CSV column names ➔ your form field keys
export const CSV_TO_FORM: CsvToFormMap = {
  "IRC":                  "irc",
  "Brand":                "brand_id",
  "Brand Pillar":         "sub_brand_id",
  "gmmCategory":          "category_id",
  "gmmSub":               "subcategory_id",
  "gmmMarket":            "market_id",
  "Segment":              "segment_id",
  "Country":              "country_id",
  "Material Description": "material",
  "Material TR":          "material_tr",
  "EAN/UPC":              "ean_upc",
  "House":                "house",
  "Line":                 "line",
  "Line ID":              "line_id",
  "Line Number":          "line_number",
  "Article Type":         "article_type",
  "Article Sub Type":     "article_sub_type",
  "Division":             "division",
  "ICP EUR":              "icp_cost",
  "ICP USD":              "icp_usd",
  "Cssp Trex EUR":        "cssp_trex_eur",
  "Cssp Trex USD":        "cssp_trex_usd",
  "Factory":              "factory",
  "Commodity ID":         "commodity_id",
  "Gender":               "gender",
  "Size":                 "size",
  "Length":               "length",
  "Height":               "height",
  "Width":                "width",
  "Volume":               "volume",
  "Gross Weight":         "gross_weight",
  "Net Weight":           "net_weight",
  "Units":                "units",
  "Shade":                "shade",
  "Currency":             "currency",
};

// 2) Exact list of headers to validate against
export const REQUIRED_HEADERS = [
  "IRC",
  "Brand",
  "Brand Pillar",
  "gmmCategory",
  "gmmSub",
  "gmmMarket",
  "Segment",
  "Country",
  "Material Description",
  "Material TR",
  "EAN/UPC",
  "House",
  "Line",
  "Line ID",
  "Line Number",
  "Article Type",
  "Article Sub Type",
  "Division",
  "ICP EUR",
  "ICP USD",
  "Cssp Trex EUR",
  "Cssp Trex USD",
  "Factory",
  "Commodity ID",
  "Gender",
  "Size",
  "Length",
  "Height",
  "Width",
  "Volume",
  "Gross Weight",
  "Net Weight",
  "Units",
  "Shade",
  "Currency",
] as const;

// 3) Classify by date or number
const DATE_KEYS = new Set<keyof OfferingProductFormValues>([
  "launch_date",
  "discontinue_date",
]);
const NUMBER_KEYS = new Set<keyof OfferingProductFormValues>([
  "icp_cost",
  "icp_usd",
  "cssp_trex_eur",
  "cssp_trex_usd",
  "length",
  "height",
  "width",
  "volume",
  "gross_weight",
  "net_weight",
  "units",
]);

// import { OfferingProductFormValues } from "@/components/AddInnovation/AddProductToOfferingModal";
// import Papa from "papaparse";
// import { useCallback } from "react";
// import { toast } from "react-toastify";

// type CsvToFormMap = {
//   [header: string]: keyof OfferingProductFormValues;
// };

// … your CSV_TO_FORM, REQUIRED_HEADERS, DATE_KEYS, NUMBER_KEYS stay the same …

export const useCsvProductBulkUploader = (
  onUpload: (rows: OfferingProductFormValues[]) => void,
  submitData?: (file: File, offeringId: number) => void
) => {
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, offeringId: number) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors.length) {
            console.error("Parsing errors:", errors);
            toast.error("Error parsing CSV file");
            return;
          }
          if (!data.length) {
            toast.error("CSV is empty");
            return;
          }

          // 1) Validate required headers
          const headers = Object.keys(data[0]);
          const missingCols = REQUIRED_HEADERS.filter(h => !headers.includes(h));
          if (missingCols.length) {
            toast.error(`Missing columns: ${missingCols.join(", ")}`);
            return;
          }

          // 2) Transform rows, collecting row-specific errors
          const rows: OfferingProductFormValues[] = [];
          const rowErrors: string[] = [];

          data.forEach((row, idx) => {
            const form: Partial<OfferingProductFormValues> = {};

            for (const [col, key] of Object.entries(CSV_TO_FORM)) {
              const raw = row[col]?.trim();
              if (!raw) continue;
              if (DATE_KEYS.has(key)) {
                // match DD/MM/YYYY or DD-MM-YYYY
                const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
                if (match) {
                  console.debug(`Parsing date: ${raw}`);
                  const [, dd, mm, yyyy] = match;
                  // emit as MM/DD/YYYY
                  form[key] = `${mm.padStart(2, "0")}/${dd.padStart(2, "0")}/${yyyy}` as any;
                } else {
                  console.debug(`Parsing date with fallback: ${raw}`);
                  // fallback: parse anything Date can and re-format
                  const d = new Date(raw);
                  if (!isNaN(d.getTime())) {
                    const m2 = String(d.getMonth() + 1).padStart(2, "0");
                    const d2 = String(d.getDate()).padStart(2, "0");
                    const y2 = d.getFullYear();
                    form[key] = `${m2}/${d2}/${y2}` as any;
                  }
                }
              } else if (NUMBER_KEYS.has(key)) {
                const num = Number(raw);
                if (!isNaN(num)) form[key] = num as any;
              } else {
                form[key] = raw as any;
              }
            }

            // check missing required form fields for this row
            const missingFields = (REQUIRED_HEADERS as readonly string[])
              .map(h => CSV_TO_FORM[h]!)
              .filter((k): k is keyof OfferingProductFormValues => !(k in form));

            if (missingFields.length) {
              rowErrors.push(
                `Row ${idx + 1}: missing ${missingFields.join(", ")}`
              );
            } else {
              rows.push(form as OfferingProductFormValues);
            }
          });

          // 3) If any row errors, show them and abort
          if (rowErrors.length) {
            toast.error(
              `CSV validation errors:\n${rowErrors.join("\n")}`,
              { autoClose: 8000 }
            );
            return;
          }

          // 4) All good → hand off
          onUpload(rows);
          if (submitData) submitData(file, offeringId);
          toast.success(`Processed ${rows.length} rows`);
        },
        error: err => {
          console.error(err);
          toast.error("Error parsing CSV file");
        },
      });

      // reset the file input
      event.target.value = "";
    },
    [onUpload, submitData]
  );

  return { handleFileUpload };
};