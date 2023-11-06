export interface BinResponse {
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: string;
  };
  requests?: RequestDetails[];
}

export interface RequestDetails {
  id: string;
  url: {
    pathname: string;
    search: string;
  };
  size: number;
  method: string;
  timestamp: string;
  headers: Record<string, string>;
}
