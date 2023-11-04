import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import { S3Client } from "@aws-sdk/client-s3";

const accountid = '41b5265674e8a276f1fa00f2c9884e59';
const secretAccessKey = `0b5c9d22fcfae95f4f7ef722b98102a04df7e4afb7c268dc04d1a69330c93848`;
const accessKeyId = `fe610bdb6ec6d6832b223fefb3e04733`;

export default async function (request: ZuploRequest, context: ZuploContext) {
  // const s3 = new S3({
  //   endpoint: `https://${accountid}.r2.cloudflarestorage.com`,
  //   accessKeyId: `fe610bdb6ec6d6832b223fefb3e04733`,
  //   secretAccessKey: `0b5c9d22fcfae95f4f7ef722b98102a04df7e4afb7c268dc04d1a69330c93848`,
  //   signatureVersion: 'v4',
  // });

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountid}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  return await s3.listObjects({ Bucket: 'mockbin' });

}