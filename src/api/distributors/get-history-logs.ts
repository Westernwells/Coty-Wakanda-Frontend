import { axios } from "@/lib/axios";

interface HistoryLogCauser {
  id: number;
  name: string;
  surname: string;
  email: string;
}

interface HistoryLogItem {
  id: number;
  action: string;
  title: string;
  created_at: string;
  old: Record<string, unknown> | unknown[];
  new: Record<string, unknown> | unknown[];
  causer: HistoryLogCauser;
}

interface HistoryLogsMeta {
  cursor: number;
  page_size: number;
  has_previous: boolean;
  has_next: boolean;
  total: number;
}

export interface GetHistoryLogsResponse {
  message: string;
  data: HistoryLogItem[];
  meta: HistoryLogsMeta;
}

export interface GetHistoryLogsParams {
  distributorId: number | string;
  cursor?: number;
  page_size?: number;
}

export async function getHistoryLogs({
  distributorId,
  cursor = 1,
  page_size = 20,
}: GetHistoryLogsParams): Promise<GetHistoryLogsResponse> {
  const response = await axios.get(
    `/distributors/${distributorId}/history-logs`,
    {
      params: { cursor, page_size },
    }
  );
  return response.data;
}
