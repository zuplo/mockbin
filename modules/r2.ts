
const BASE_URL = "https://api.cloudflare.com/client/v4"

export interface UploadObjectResult {
  key: string,
  size: number,
  etag: string,
  version: string,
  /**
   * Timestamp 2023-11-04T21:39:12.882Z
   */
  uploaded: string
}

export interface ListObjectsResult {
  key: string,
  size: number,
  etag: string,
  last_modified: string,
  http_metadata?: {
    contentType?: string
  },
  custom_metadata?: Record<string, string>
}

export interface CloudflareApiResponse<TResult = any> {
  success: boolean;
  errors: { code: string, message: string }[];
  messages: string[];
  result: TResult[];
}

export class CloudflareR2Client {

  private apiKey: string;
  private accountId: string;
  private bucketName: string;

  constructor(options: { apiKey: string, accountId: string, bucketName: string }) {
    this.apiKey = options.apiKey;
    this.accountId = options.accountId;
    this.bucketName = options.bucketName;
  }

  public async getObject(objectId: string) {
    const url = new URL(`${BASE_URL}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${objectId}`);
    return this.cfFetch(url);
  }

  public async listObjects(prefix: string): Promise<CloudflareApiResponse<ListObjectsResult>> {
    const url = new URL(`${BASE_URL}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects`);
    url.searchParams.set("prefix", prefix)
    url.searchParams.set("list-type", "2")
    const response = await this.cfFetch(url);
    const result: CloudflareApiResponse<ListObjectsResult> = await response.json();
    return result;
  }

  public async uploadObject(objectId: string, body: BodyInit, metadata?: Record<string, string>): Promise<CloudflareApiResponse<UploadObjectResult>> {
    const url = new URL(`${BASE_URL}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${objectId}`);
    const headers = new Headers({
      "content-type": "application/json"
    })
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        headers.set(`x-amz-meta-${key}`, value)
      }
    }
    const response = await this.cfFetch(url, {
      method: "PUT",
      body,
      headers
    });
    const result: CloudflareApiResponse<UploadObjectResult> = await response.json();
    return result;
  }


  private async cfFetch(url: URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("authorization", `Bearer ${this.apiKey}`)
    return fetch(url.toString(), {
      headers,
      method: init?.method,
      body: init?.body
    });
  }

}