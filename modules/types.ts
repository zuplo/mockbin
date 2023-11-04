export interface BinResponse {
  response: {
    status: number,
    statusText?: string,
    headers?: Record<string, string>,
    body?: string
  }
}

export interface GetRequestsResponse {
  data: {
    "requestId": string
  }[]
}

export interface GetRequestResponse {
  timestamp: "string",
  method: string,
  headers: Record<string, string>,
  body: string
}
