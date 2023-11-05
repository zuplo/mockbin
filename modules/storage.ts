import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger } from "@zuplo/runtime";
const BASE_URL = "https://api.cloudflare.com/client/v4";

export interface UploadObjectResult {
  key: string;
}

export interface ListObjectsResult {
  key: string;
  size: number;
  etag: string;
  lastModified: Date;
  // httpMetadata?: {
  //   contentType?: string;
  // };
  // customMetadata?: Record<string, string>;
}

export interface GetObjectResult {
  body: string;
  contentType: string | undefined;
  lastModified: Date | undefined;
}
export interface CloudflareApiResponse<TResult = any> {
  success: boolean;
  errors: { code: string; message: string }[];
  messages: string[];
  result: TResult[];
}

export class StorageError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class StorageClient {
  private bucketName: string;
  private logger: Logger;

  private S3: S3Client;

  constructor(options: {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    logger: Logger;
  }) {
    this.bucketName = options.bucketName;
    this.logger = options.logger;

    this.S3 = new S3Client({
      region: "auto",
      endpoint: options.endpoint,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.accessKeySecret,
      },
    });
  }

  public async getObject(objectId: string): Promise<GetObjectResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectId,
    });

    const response = await this.S3.send(command);

    if (!response.Body) {
      throw new StorageError("Not found", 404);
    }

    return {
      body: await response.Body?.transformToString(),
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  }

  public async listObjects(prefix: string): Promise<ListObjectsResult[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });
    const response = await this.S3.send(command);
    const data: ListObjectsResult[] =
      response.Contents?.map((obj) => ({
        key: obj.Key!,
        size: obj.Size!,
        etag: obj.ETag!,
        lastModified: obj.LastModified!,
      })) ?? [];

    return data;
  }

  public async uploadObject(
    objectId: string,
    body: string,
    metadata?: Record<string, string>,
  ): Promise<UploadObjectResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectId,
      Body: body,
      Metadata: metadata,
    });
    await this.S3.send(command);

    return {
      key: objectId,
    };
  }
}
