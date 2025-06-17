const SAMPLE_DATA =[{
  "irc": "3456",
  "material": "Testing Things ou",
  "icp_cost": 1234,
  "price": 1234,
  "currency": "USD",
  "brand_id": "7",
  "sub_brand_id": "146",
  "product_type": "saleable",
  "pref": "pref",
  "grouping": "1",
  "division": "mass",
  "brand_category": "formal",
  "ean_upc": "12345",
  "house": "667",
  "line": "67",
  "line_id": 67,
  "article_type": "56",
  "offering_number": "45",
  "launch_date": "2025-09-11",
  "discontinue_date": "2025-10-23",
  "category_id": "8",
  "subcategory_id": "13",
  "market_id": "29",
  "segment_id": "69",
  "factory": "kilo",
  "commodity_id": "34",
  "country_id": "186",
  "gender": "male",
  "size": "45",
  "length": 45,
  "height": 45,
  "width": 45,
  "volume": 45,
  "gross_weight": 54,
  "net_weight": 45,
  "units": 45,
  "icp_usd": 1234,
  "icp_eur": 1234,
}]

export function downloadSampleProductCsv(): string {
  const records = SAMPLE_DATA
  if (!records.length) {
    return "";
  }
  console.log("Generating CSV for records:", records);

  // 1) Collect all unique keys in order of appearance
  const headers: string[] = [];
  for (const rec of records) {
    for (const key of Object.keys(rec)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
  }

  // 2) Build each row of values
  const rows = records.map((rec) =>
    headers
      .map((key) => {
        let val = (rec as Record<string, any>)[key];
        if (val == null) {
          return "";
        }
        // format dates as ISO strings
        if (val instanceof Date) {
          val = val.toISOString();
        }
        const str = String(val);
        // quote if needed
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  // 3) Join header + rows
  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "sample-products.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return csvContent; // Return the CSV content if needed
}