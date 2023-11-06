export interface BinResponseData {
  response?: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: string;
  };
  requests?: BinRequestData[];
}

export interface BinRequestData {
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
