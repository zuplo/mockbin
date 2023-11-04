export interface BinResponse {
  response: {
    status: number,
    statusText?: string,
    headers?: Record<string, string>,
    body?: string
  }
}

export interface RequestsResponse {
  data: {
    "requestId": string
  }[]
}

export interface RequestDetails {
  timestamp: string,
  method: string,
  headers: Record<string, string>,
  body: string
}
