import {
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger } from "@zuplo/runtime";

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

    let response: GetObjectCommandOutput;
    try {
      response = await this.S3.send(command);
    } catch (err) {
      this.logger.error(err);
      if (err instanceof Error && err.name === "NoSuchKey") {
        throw new StorageError(err.message, 404);
      }
      throw err;
    }
    if (!response.Body) {
      this.logger.error(`No body on S3 object`);
      throw new StorageError("Not found", 404);
    }

    return {
      body: await response.Body?.transformToString(),
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  }

  public async listObjects(options: {
    prefix: string;
    limit?: number;
  }): Promise<ListObjectsResult[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: options.prefix,
      MaxKeys: options.limit,
    });
    let response: ListObjectsV2CommandOutput;
    try {
      response = await this.S3.send(command);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
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
    body: string | Uint8Array | ReadableStream | Blob,
    metadata?: Record<string, string>,
  ): Promise<UploadObjectResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectId,
      Body: body,
      Metadata: metadata,
    });
    try {
      await this.S3.send(command);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
    return {
      key: objectId,
    };
  }
}
