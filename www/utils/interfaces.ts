export interface BinResponse {
  url: string;
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: string;
  };
}

export interface RequestListResponse {
  url: string;
  data: RequestListItem[];
}

export interface RequestListItem {
  id: string;
  method: string;
  timestamp: string;
  size: number;
}

export interface RequestData {
  url: {
    pathname: string;
    search: string;
  };
  size: number;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface RequestDetails extends RequestData {
  id: string;
  timestamp: string;
}
