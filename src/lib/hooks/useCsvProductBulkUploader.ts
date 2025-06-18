import { OfferingProductFormValues } from "@/components/AddInnovation/AddProductToOfferingModal";
import Papa from "papaparse";
import { useCallback } from "react";
import { toast } from "react-toastify";

type CsvToFormMap = {
  [header: string]: keyof OfferingProductFormValues;
};


export const CSV_TO_FORM: CsvToFormMap = {
  irc:                  "irc",
  material: "material",
  icp_cost:             "icp_cost",
  price:                "price",
  currency:             "currency",
  brand_id:             "brand_id",
  sub_brand_id:         "sub_brand_id",
  product_type:         "product_type",
  pref:                 "pref",
  grouping:             "grouping",
  division:             "division",
  brand_category:       "brand_category",
  ean_upc:              "ean_upc",
  house:                "house",
  line:                 "line",
  line_id:              "line_id",
  article_type:         "article_type",
  launch_date:          "launch_date",
  discontinue_date:     "discontinue_date",
  category_id:          "category_id",
  subcategory_id:       "subcategory_id",
  market_id:            "market_id",
  segment_id:           "segment_id",
  factory:              "factory",
  commodity_id:         "commodity_id",
  country_id:           "country_id",
  gender:               "gender",
  size:                 "size",
  length:               "length",
  height:               "height",
  width:                "width",
  volume:               "volume",
  gross_weight:         "gross_weight",
  net_weight:           "net_weight",
  units:                "units",
  icp_usd:              "icp_usd",
};

export const REQUIRED_HEADERS = [
  "irc",
  "material",
  "icp_cost",
  "price",
  "currency",
  "brand_id",
  "sub_brand_id",
  "product_type",
  "pref",
  "grouping",
  "division",
  "brand_category",
  "ean_upc",
  "house",
  "line",
  "line_id",
  "article_type",
  "launch_date",
  "discontinue_date",
  "category_id",
  "subcategory_id",
  "market_id",
  "segment_id",
  "factory",
  "commodity_id",
  "country_id",
  "gender",
  "size",
  "length",
  "height",
  "width",
  "volume",
  "gross_weight",
  "net_weight",
  "units",
  "icp_usd",
] as const;

// classify by suffix or explicitly:
const DATE_KEYS = new Set<keyof OfferingProductFormValues>([
  "launch_date",
  "discontinue_date",
]);
const NUMBER_KEYS = new Set<keyof OfferingProductFormValues>([
  "icp_cost",
  "price",
  "icp_eur",
  "icp_usd",
  "length",
  "height",
  "width",
  "volume",
  "gross_weight",
  "net_weight",
  "units",
]);

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

          // 2) Transform rows
          const rows: OfferingProductFormValues[] = data
            .map(row => {
              const form: Partial<OfferingProductFormValues> = {};

              for (const [col, key] of Object.entries(CSV_TO_FORM)) {
                const raw = row[col]?.trim();
                if (!raw) continue;

                if (DATE_KEYS.has(key)) {
                  let parsedDate: Date | null = null;

                  // 1) Detect dd/MM/YYYY format
                  const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                  if (ddmmyyyy) {
                    const [, dd, mm, yyyy] = ddmmyyyy;
                    parsedDate = new Date(
                      Number(yyyy),
                      Number(mm) - 1,
                      Number(dd)
                    );
                  } else {
                    // 2) Try the built-in parser (ISO, etc.)
                    const tryIso = new Date(raw);
                    if (!isNaN(tryIso.getTime())) {
                      parsedDate = tryIso;
                    }
                  }
                
                  if (parsedDate) {
                    form[key] = parsedDate as any;
                  }
                } else if (NUMBER_KEYS.has(key)) {
                  const num = Number(raw);
                  if (!isNaN(num)) form[key] = num as any;
                } else {
                  // fallback to string
                  form[key] = raw as any;
                }
              }

              // 3) Ensure all required form fields are present
              const missingFields = (REQUIRED_HEADERS as readonly string[])
                .map(h => CSV_TO_FORM[h])
                .filter((k): k is keyof OfferingProductFormValues => !(k in form));

              if (missingFields.length) {
                console.log("Missing fields:", missingFields);
                return null;
              }

              return form as OfferingProductFormValues;
            })
            .filter((r): r is OfferingProductFormValues => r != null);

          if (!rows.length) {
            toast.error("No valid data rows found");
            return;
          }

          onUpload(rows);
          if (submitData) submitData(file, offeringId);
          toast.success(`Processed ${rows.length} rows`);
        },
        error: err => {
          console.error(err);
          toast.error("Error parsing CSV file");
        },
      });
      // reset input
      event.target.value = "";
    },
    [onUpload, submitData]
  );

  return { handleFileUpload };
};

