import { axios } from "@/lib/axios";

interface DeleteOfferingProductParams {
  innovationId: string | number;
  offeringId: string | number;
  productId: number;
}

async function deleteOfferingProduct({
  innovationId,
  offeringId,
  productId,
}: DeleteOfferingProductParams) {
  console.log("deleteOfferingProduct", innovationId, offeringId, productId);
  const response = await axios.delete(
    `/innovations/${innovationId}/offerings/${offeringId}/products/${productId}`
  );

  return response;
}

export async function deleteOfferingProducts({
  innovationId,
  offeringId,
  productIds,
}: {
  innovationId: string | number;
  offeringId: string | number;
  productIds: number[];
}) {
  // Map through each product ID and delete them one by one
  const deletePromises = productIds.map((productId) =>
    deleteOfferingProduct({
      innovationId,
      offeringId,
      productId,
    })
  );

  // Wait for all deletions to complete
  const results = await Promise.allSettled(deletePromises);

  // Check if any deletions failed
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );

  if (failures.length > 0) {
    // If any deletions failed, throw an error with details
    throw new Error(
      `Failed to delete ${failures.length} products: ${failures
        .map((f) => f.reason)
        .join(", ")}`
    );
  }

  return results.map((result) =>
    result.status === "fulfilled" ? result.value : null
  );
}
