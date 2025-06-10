import { OfferingProductFormValues } from "@/components/AddInnovation/AddProductToOfferingModal";
import Papa from "papaparse";
import { useCallback } from "react";
import { toast } from "react-toastify";

type CsvToFormMap = {
  [header: string]: keyof OfferingProductFormValues;
};

const CSV_TO_FORM: CsvToFormMap = {
  IRC: "irc",
  "ICP Cost": "icp_cost",
  Currency: "currency",
  "Brand ID": "brand_id",
  "Sub Brand ID": "sub_brand_id",
  "Product Type": "product_type",
  Pref: "pref",
  Grouping: "grouping",
  Division: "division",
  "Brand Category": "brand_category",
  "EAN/UPC": "ean_upc",
  House: "house",
  Line: "line",
  "Article Type": "article_type",
  "Offering Number": "offering_number",
  "Launch Date": "launch_date",
  "Discontinue Date": "discontinue_date",
  "Category ID": "category_id",
  "Subcategory ID": "subcategory_id",
  "Market ID": "market_id",
  "Segment ID": "segment_id",
  "ICP EUR": "icp_eur",
  "ICP USD": "icp_usd",
  Factory: "factory",
  "Commodity ID": "commodity_id",
  "Country ID": "country_id",
  Gender: "gender",
  Size: "size",
  Length: "length",
  Height: "height",
  Width: "width",
  Volume: "volume",
  "Gross Weight": "gross_weight",
  "Net Weight": "net_weight",
  Units: "units",
  Price: "price",
};

const REQUIRED_HEADERS = [
  "IRC",
  "ICP Cost",
  "Currency",
  "Brand ID",
  "Product Type",
  "Pref",
  "Grouping",
  "Division",
  "Brand Category",
  "EAN/UPC",
  "House",
  "Line",
  "Article Type",
  "Category ID",
  "Subcategory ID",
  "Market ID",
  "Segment ID",
  "Commodity ID",
  "Country ID",
  "Gender",
  "Size",
];

export const useCsvProductBulkUploader = (
  onUpload: (rows: OfferingProductFormValues[]) => void,
  submitData?: (file: File) => void
) => {
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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

          // Validate required headers
          const headers = Object.keys(data[0]);
          const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
          if (missing.length) {
            toast.error(`Missing columns: ${missing.join(", ")}`);
            return;
          }

          // Transform rows
          const rows: OfferingProductFormValues[] = data
            .map((row) => {
              // Build a partial form object
              const form: Partial<OfferingProductFormValues> = {};

              for (const [col, key] of Object.entries(CSV_TO_FORM)) {
                const raw = row[col]?.trim();
                if (raw == null || raw === "") continue;

                switch (key) {
                  case "irc":
                  case "brand_id":
                  case "division":
                  case "brand_category":
                  case "ean_upc":
                  case "house":
                  case "line":
                  case "article_type":
                  case "category_id":
                  case "subcategory_id":
                  case "market_id":
                  case "segment_id":
                  case "commodity_id":
                  case "country_id":
                  case "gender":
                  case "size":
                  case "product_type":
                  case "pref":
                  case "grouping":
                  case "currency":
                    form[key] = raw as unknown as undefined;
                    break;

                  case "icp_cost":
                  case "price":
                  case "icp_eur":
                  case "icp_usd":
                  case "length":
                  case "height":
                  case "width":
                  case "volume":
                  case "gross_weight":
                  case "net_weight":
                  case "units": {
                    const num = Number(raw);
                    if (!isNaN(num)) form[key] = num;
                    break;
                  }

                  case "sub_brand_id":
                  case "line_id":
                  case "offering_number":
                  case "factory":
                    form[key] = raw;
                    break;

                  case "launch_date":
                  case "discontinue_date": {
                    const d = new Date(raw);
                    if (!isNaN(d.getTime())) form[key] = d;
                    break;
                  }

                  default:
                    break;
                }
              }

              // Now ensure all required form fields are present
              const missingFields = REQUIRED_HEADERS.map(
                (h) => CSV_TO_FORM[h]
              ).filter((k) => !(k in form));
              if (missingFields.length) return null;

              return form as OfferingProductFormValues;
            })
            .filter((r): r is OfferingProductFormValues => r != null);

          if (!rows.length) {
            toast.error("No valid data rows found");
            return;
          }

          console.log("Uploading:", rows);
          onUpload(rows);
          if (submitData) {
            submitData(file);
          }
          toast.success(`Processed ${rows.length} rows`);
        },
        error: (err) => {
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
