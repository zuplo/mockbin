import { environment } from "@zuplo/runtime";

/**
 * Set to 'true' if you are hosting this service on a wildcard subdomain
 *
 */
export const USE_WILDCARD_SUBDOMAIN =
  environment.USE_WILDCARD_SUBDOMAIN === "true";

export const MAX_BIN_SIZE = environment.MAX_BIN_SIZE
  ? parseInt(environment.MAX_BIN_SIZE)
  : 262144;

type RequiredVariables =
  | "S3_ENDPOINT"
  | "S3_ACCESS_KEY_ID"
  | "S3_SECRET_ACCESS_KEY"
  | "BUCKET_NAME";

export function requiredEnvVariable(name: RequiredVariables): string {
  const val = environment[name];
  if (!val) {
    throw new Error(`The environment variable ${name} is not set.`);
  }
  return val;
}
