import { useCallback } from "react";
import Papa from "papaparse";
import { toast } from "react-toastify";

interface CsvUploadProps {
  onUpload: (
    data: Array<{
      brand_name: string;
      description: string;
      brand_pillar: string;
      article_type: string;
      price: number;
      irc: string;
    }>
  ) => void;
}

interface CsvRow {
  "Brand Name": string;
  Description: string;
  "Brand Line (Pillar)": string;
  "Article Type": string;
  IRC: string;
  "Base Price": string;
  [key: string]: string;
}

export function CsvUpload({ onUpload }: CsvUploadProps) {
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }

      // Parse CSV file
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<CsvRow>) => {
          try {
            // Validate headers
            const requiredHeaders = [
              "Brand Name",
              "Description",
              "Brand Line (Pillar)",
              "Article Type",
              "IRC",
              "Base Price",
            ];
            const headers = Object.keys(results.data[0] || {});
            const missingHeaders = requiredHeaders.filter(
              (h) => !headers.includes(h)
            );

            if (missingHeaders.length > 0) {
              toast.error(
                `Missing required columns: ${missingHeaders.join(", ")}`
              );
              return;
            }

            // Transform data to required format
            const transformedData = results.data
              .filter((row: CsvRow) => row["Base Price"] && row.IRC) // Filter out rows without Base Price or IRC
              .map((row: CsvRow) => ({
                brand_name: row["Brand Name"],
                description: row.Description,
                brand_pillar: row["Brand Line (Pillar)"],
                article_type: row["Article Type"],
                price: Number(row["Base Price"]),
                irc: row.IRC,
              }))
              .filter((item) => !isNaN(item.price)); // Filter out invalid prices

            if (transformedData.length === 0) {
              toast.error("No valid data found in CSV");
              return;
            }

            // Log the transformed data for debugging
            console.log("Transformed data:", transformedData);

            onUpload(transformedData);
            toast.success(
              `Successfully processed ${transformedData.length} products`
            );
          } catch (error) {
            console.error("Error processing CSV:", error);
            toast.error("Error processing CSV file");
          }
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error);
          toast.error("Error parsing CSV file");
        },
      });

      // Reset file input
      event.target.value = "";
    },
    [onUpload]
  );

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Upload List
      </label>
    </div>
  );
}
