export interface BinResponse {
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: string;
  };
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
