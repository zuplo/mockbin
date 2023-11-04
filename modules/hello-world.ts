import { environment, ZuploContext, ZuploRequest } from "@zuplo/runtime";

// You should replace these constants with your actual values
const BUCKET_NAME = 'mockbin';
const AUTH_TOKEN = environment.R2_KEY; // Be very careful with this token and do not expose it publicly
const FILE_NAME = 'example.txt';
const FILE_CONTENTS = 'Hello, this is the content of the file.';
const CLOUDFLARE_ACCOUNT_ID = '41b5265674e8a276f1fa00f2c9884e59';

// Function to upload text file to Cloudflare R2
async function uploadTextFileToR2(bucketName, fileName, fileContents, authToken, accountId, context) {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(fileName)}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'text/plain',
    },
    body: fileContents,
  });

  if (!response.ok) {
    context.log.error({ status: response.status, statusText: response.statusText, body: await response.text() })
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    return await response.json();
  }
}

export default async function (request: ZuploRequest, context: ZuploContext) {
  uploadTextFileToR2(BUCKET_NAME, FILE_NAME, FILE_CONTENTS, AUTH_TOKEN, CLOUDFLARE_ACCOUNT_ID, context)
    .then(data => context.log.log('File uploaded successfully:', data))
    .catch(error => context.log.error('There was an error uploading the file:', error));
  return 'ok';

}
