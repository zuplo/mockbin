export interface BinResponse {
  status: number,
  statusText?: string,
  headers?: Record<string, string>,
  body?: string
}

export interface RequestsResponse {
  data: {
    requestId: string;
    method: string;
    pathname: string;
    timestamp: string;
  }[]
}

export interface RequestDetails {
  url: {
    pathname: string;
    search: string;
  };
  method: string;
  headers: Record<string, string>;
  body: string | null;
}
