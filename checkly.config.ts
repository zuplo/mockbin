import { defineConfig } from "checkly";

/**
 * See https://www.checklyhq.com/docs/cli/project-structure/
 */
const config = defineConfig({
  projectName: "Mockbin",
  logicalId: "mockbin",
  repoUrl: "https://github.com/zuplo/mockbin",
  checks: {
    runtimeId: "2024.02",
    checkMatch: "checks/**/*.check.ts",
    tags: ["service-mockbin", "priority-in-hours"],
  },
  cli: {
    runLocation: "us-east-1",
    reporters: ["list"],
    retries: 0,
  },
});

export default config;
