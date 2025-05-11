import { useState, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getHistoryLogs,
  GetHistoryLogsResponse,
} from "@/api/distributors/get-history-logs";

interface DistributorHistorySummaryProps {
  distributorId: string | number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLatestLogByTitle(
  logs: GetHistoryLogsResponse["data"],
  title: string
) {
  return logs.find((log) => log.title.toLowerCase() === title.toLowerCase());
}

export function DistributorHistorySummary({
  distributorId,
}: DistributorHistorySummaryProps) {
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Summary query
  const { data } = useQuery({
    queryKey: ["distributor-history-logs", distributorId],
    queryFn: () => getHistoryLogs({ distributorId, page_size: 10 }),
    enabled: !showFullHistory,
  });

  const logs = data?.data || [];
  const distributorLog = getLatestLogByTitle(logs, "Distributor details");
  const pricingLog = getLatestLogByTitle(logs, "Pricing rules");
  const coefficientsLog = getLatestLogByTitle(logs, "Co-efficients");

  // Infinite query for full history
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingFullHistory,
  } = useInfiniteQuery({
    queryKey: ["distributor-history-logs-full", distributorId],
    queryFn: ({ pageParam = 1 }) =>
      getHistoryLogs({ distributorId, cursor: pageParam, page_size: 20 }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta.has_next ? meta.cursor + 1 : undefined;
    },
    enabled: showFullHistory,
    initialPageParam: 1,
  });

  // Intersection Observer for infinite scroll
  const lastLogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      let observer: IntersectionObserver;
      if (node) {
        observer = new window.IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
        });
        observer.observe(node);
      }
      return () => observer && observer.disconnect();
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (showFullHistory) {
    return (
      <div className="bg-[#e9eef2] p-6 my-10 rounded-md text-primary-900 text-[17px] space-y-6">
        <button
          className="mb-4 px-3 py-1 rounded bg-primary text-white hover:bg-primary-700"
          onClick={() => setShowFullHistory(false)}
        >
          Back to summary
        </button>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {isLoadingFullHistory && <div>Loading...</div>}
          {infiniteData?.pages.map((page, i) =>
            page.data.map((log, j) => {
              const isLast =
                i === infiniteData.pages.length - 1 &&
                j === page.data.length - 1;
              return (
                <div
                  key={log.id}
                  ref={isLast ? lastLogRef : undefined}
                  className="border-b pb-2 mb-2"
                >
                  <div className="font-semibold text-base">{log.title}</div>
                  <div className="text-[15px] font-normal mt-1">
                    Last update: {formatDate(log.created_at)}, {log.causer.name}{" "}
                    {log.causer.surname}
                  </div>
                </div>
              );
            })
          )}
          {isFetchingNextPage && <div>Loading more...</div>}
          {!hasNextPage && !isLoadingFullHistory && (
            <div className="text-center text-gray-500 mt-4">
              No more history
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e9eef2] p-6 my-10 rounded-md text-primary-900 text-[17px] space-y-6">
      {distributorLog && (
        <div>
          <span className="font-semibold text-base">Distributor details</span>
          <div className="text-[15px] font-normal mt-1">
            Last update:{" "}
            {`${formatDate(distributorLog.created_at)}, ${distributorLog.causer.name} ${distributorLog.causer.surname}`}
          </div>
        </div>
      )}
      {pricingLog && (
        <div>
          <span className="font-semibold text-base">Pricing rules</span>
          <div className="text-[15px] font-normal mt-1">
            Last update:{" "}
            {`${formatDate(pricingLog.created_at)}, ${pricingLog.causer.name} ${pricingLog.causer.surname}`}
          </div>
        </div>
      )}
      {coefficientsLog && (
        <div>
          <span className="font-semibold text-base">Co-efficients</span>
          <div className="text-[15px] font-normal mt-1">
            Last update:{" "}
            {`${formatDate(coefficientsLog.created_at)}, ${coefficientsLog.causer.name} ${coefficientsLog.causer.surname}`}
          </div>
        </div>
      )}
      <div>
        <button
          className="text-primary underline text-[15px] font-normal hover:text-primary-700"
          onClick={() => setShowFullHistory(true)}
        >
          Full history log
        </button>
      </div>
    </div>
  );
}
