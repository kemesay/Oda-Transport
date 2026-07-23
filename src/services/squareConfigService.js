import { BACKEND_API } from "../store/utils/API";
import {
  SANDBOX_APPLICATION_ID_PREFIX,
  getSquareSdkUrl,
  isSquarePaymentsEnabled,
  mergeSquareConfig,
} from "../config/squareCredentials";

let cachedConfig = null;
let configPromise = null;

function validateConfig(config) {
  if (!config?.squareEnabled) {
    return config;
  }
  const env = (config.environment || "sandbox").toLowerCase();
  const appId = config.applicationId || "";
  const locationId = config.locationId || "";

  if (!appId || !locationId) {
    throw new Error("Square config is missing applicationId or locationId.");
  }
  if (env === "sandbox" && !appId.startsWith(SANDBOX_APPLICATION_ID_PREFIX)) {
    throw new Error(
      `Sandbox Application ID must start with "${SANDBOX_APPLICATION_ID_PREFIX}".`
    );
  }
  return config;
}

export { getSquareSdkUrl, isSquarePaymentsEnabled };

export function getCachedSquareConfig() {
  return cachedConfig;
}

export function clearSquareConfigCache() {
  cachedConfig = null;
  configPromise = null;
}

export async function fetchSquareConfig({ force = false } = {}) {
  if (!force && cachedConfig) {
    return cachedConfig;
  }
  if (!force && configPromise) {
    return configPromise;
  }

  configPromise = BACKEND_API.get("/api/v1/payments/square/config")
    .then((res) => {
      const config = validateConfig(mergeSquareConfig(res.data));
      cachedConfig = config;
      return config;
    })
    .catch((err) => {
      configPromise = null;
      throw err;
    });

  return configPromise;
}

export function isSquareEnabled(config) {
  return Boolean(config?.squareEnabled) && isSquarePaymentsEnabled();
}
