import type { KnipConfig } from "knip";

export default {
  ignoreDependencies: [
    "gitzy",
    "@commitlint/config-conventional",
    "commitlint",
  ],
  ignoreExportsUsedInFile: true,
} satisfies KnipConfig;
