import { environment } from "@zuplo/runtime";

export const USE_SUBDOMAIN = environment.USE_SUBDOMAIN === "true";
export const R2_API_KEY = environment.R2_API_KEY!;
export const CF_ACCOUNT_ID = environment.CF_ACCOUNT_ID!;
export const R2_BUCKET_NAME = environment.R2_BUCKET_NAME!;
