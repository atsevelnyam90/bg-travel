import type { CapacitorConfig } from "@capacitor/cli";

const capacitorServerUrl = process.env.CAPACITOR_SERVER_URL;
const serverConfig: CapacitorConfig["server"] = {
  cleartext: capacitorServerUrl?.startsWith("http://") ?? false,
};

if (capacitorServerUrl) {
  serverConfig.url = capacitorServerUrl;
}

const config: CapacitorConfig = {
  appId: "mn.winu.starter",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Winu Starter",
  webDir: "out",
  server: serverConfig,
  android: {
    adjustMarginsForEdgeToEdge: "auto",
  },
  ios: {
    scheme: "App",
    contentInset: "never",
  },
};

export default config;
