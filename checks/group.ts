/* eslint-disable node/no-process-env */
/**
 * This is a Checkly CLI CheckGroup construct. To learn more, visit:
 * - https://www.checklyhq.com/docs/cli/
 * - https://www.checklyhq.com/docs/cli/constructs-reference/#checkgroup
 */

import { ApiCheckOptions, asserts, check as baseCheck } from "@zuplo/checkly";
import {
  AlertEscalationBuilder,
  CheckGroup,
  Frequency,
  RetryStrategyBuilder,
  WebhookAlertChannel,
} from "checkly/constructs";

export const incidentChannel = WebhookAlertChannel.fromId(231732);

// Alert after 2 failed runs
const alertEscalationPolicy = AlertEscalationBuilder.runBasedEscalation(2);

export const group = new CheckGroup("mockbin", {
  name: "Mockbin",
  activated: true,
  muted: false,
  runParallel: true,
  locations: ["us-east-1", "eu-west-1", "ap-southeast-2"],
  tags: [],
  alertChannels: [incidentChannel],
  alertEscalationPolicy,
  frequency: Frequency.EVERY_1H,
  concurrency: 1,
  apiCheckDefaults: {
    url: process.env.ENVIRONMENT_URL ?? "http://localhost:3000",
    queryParameters: [],
  },
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 2,
    maxDurationSeconds: 600,
    sameRegion: true,
  }),
});

const check = (props: Omit<ApiCheckOptions, "group">) =>
  baseCheck({ ...props, group });

export { asserts, check };
