export interface BinResponse {
  response: {
    status: number,
    statusText?: string,
    headers?: Record<string, string>,
    body?: string
  }
}