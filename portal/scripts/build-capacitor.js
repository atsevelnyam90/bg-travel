const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const platform = process.argv[2];
const target = process.argv[3] || "production";
const mode = process.argv[4] || "packaged";
const rootDir = path.resolve(__dirname, "..");

const targets = {
  production: {
    appEnv: "production",
    apiBaseUrl: "https://api.winu.mn/api/v1",
    remoteServerUrl: "https://portal.winu.mn",
  },
  staging: {
    appEnv: "staging",
    apiBaseUrl: "https://dev-api.winu.mn/api/v1",
    remoteServerUrl: "https://dev-portal.winu.mn",
  },
  local: {
    appEnv: "development",
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1",
    remoteServerUrl: process.env.CAPACITOR_SERVER_URL || "http://localhost:3000",
  },
};

if (
  !["android", "ios"].includes(platform) ||
  !Object.hasOwn(targets, target) ||
  !["packaged", "remote"].includes(mode)
) {
  console.error(
    "Usage: node scripts/build-capacitor.js <android|ios> [production|staging|local] [packaged|remote]",
  );
  process.exit(1);
}

const run = (command, args, env = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      ...env,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

const removeGeneratedDir = (relativePath) => {
  const targetPath = path.join(rootDir, relativePath);
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
  console.log(`Removed stale generated output: ${relativePath}`);
};

const cleanGeneratedOutputs = () => {
  removeGeneratedDir(".next");
  removeGeneratedDir("out");

  if (platform === "ios") {
    removeGeneratedDir(path.join("ios", "App", "App", "public"));
  } else {
    removeGeneratedDir(path.join("android", "app", "src", "main", "assets", "public"));
  }
};

const ensurePlatformProject = () => {
  if (fs.existsSync(path.join(rootDir, platform))) return;
  run("npx", ["cap", "add", platform]);
};

const getGeneratedConfigPath = () =>
  platform === "ios"
    ? path.join(rootDir, "ios", "App", "App", "capacitor.config.json")
    : path.join(rootDir, "android", "app", "src", "main", "assets", "capacitor.config.json");

const assertPackagedBuild = () => {
  const generatedConfigPath = getGeneratedConfigPath();

  if (!fs.existsSync(generatedConfigPath)) {
    console.error(`Generated Capacitor config was not found: ${generatedConfigPath}`);
    process.exit(1);
  }

  const generatedConfig = JSON.parse(fs.readFileSync(generatedConfigPath, "utf8"));
  const remoteUrl = generatedConfig.server?.url;

  if (remoteUrl) {
    console.error(
      `Packaged builds must use bundled web assets, but ${generatedConfigPath} contains server.url=${remoteUrl}`,
    );
    process.exit(1);
  }
};

const selected = targets[target];

ensurePlatformProject();

if (target === "local") {
  run("npx", ["cap", "sync", platform], {
    CAPACITOR_SERVER_URL: selected.remoteServerUrl,
    NEXT_PUBLIC_APP_ENV: selected.appEnv,
    NEXT_PUBLIC_API_BASE_URL: selected.apiBaseUrl,
  });
  process.exit(0);
}

const buildEnv = {
  CAPACITOR_BUILD: "true",
  CAPACITOR_PLATFORM: platform,
  NEXT_PUBLIC_APP_ENV: selected.appEnv,
  NEXT_PUBLIC_API_BASE_URL: selected.apiBaseUrl,
};
const syncEnv = {
  CAPACITOR_PLATFORM: platform,
  CAPACITOR_SERVER_URL:
    mode === "remote" ? process.env.CAPACITOR_SERVER_URL || selected.remoteServerUrl : "",
  NEXT_PUBLIC_APP_ENV: selected.appEnv,
  NEXT_PUBLIC_API_BASE_URL: selected.apiBaseUrl,
};

cleanGeneratedOutputs();
run("npx", ["next", "build"], buildEnv);
run("npx", ["cap", "sync", platform], syncEnv);

if (mode === "packaged") {
  assertPackagedBuild();
} else {
  console.log(`Using remote Capacitor server URL: ${syncEnv.CAPACITOR_SERVER_URL}`);
}
