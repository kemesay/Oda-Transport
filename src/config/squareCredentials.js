/**
 * Single source of truth for Square client credentials (React web).
 *
 * Never put the Square **access token** in the frontend — only Application ID
 * and Location ID (public). Charges run on ODA-TRANSPORTATION using server `.env`.
 *
 * Active environment: `REACT_APP_SQUARE_ENV=sandbox` | `production`
 *
 * Optional per-environment (CRA):
 *   REACT_APP_SQUARE_SANDBOX_APPLICATION_ID, REACT_APP_SQUARE_SANDBOX_LOCATION_ID
 *   REACT_APP_SQUARE_PRODUCTION_APPLICATION_ID, REACT_APP_SQUARE_PRODUCTION_LOCATION_ID
 *
 * Legacy (when env-specific vars unset):
 *   REACT_APP_SQUARE_APPLICATION_ID, REACT_APP_SQUARE_LOCATION_ID
 *
 * Runtime: prefer GET /api/v1/payments/square/config; use this module for SDK URLs,
 * validation helpers, and offline fallbacks.
 */

export const SquareEnvironment = Object.freeze({
  SANDBOX: "sandbox",
  PRODUCTION: "production",
});

/** Sandbox Application IDs always start with this prefix. */
export const SANDBOX_APPLICATION_ID_PREFIX = "sandbox-sq0idb-";

export const SQUARE_SDK_URLS = Object.freeze({
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
});

function pickCredential(environment, sandboxKey, productionKey, legacyKey) {
  const specific =
    environment === SquareEnvironment.PRODUCTION
      ? process.env[productionKey]
      : process.env[sandboxKey];
  if (specific != null && String(specific).trim() !== "") {
    return String(specific).trim();
  }
  const legacy = process.env[legacyKey];
  return legacy != null ? String(legacy).trim() : "";
}

/**
 * @returns {typeof SquareEnvironment.SANDBOX | typeof SquareEnvironment.PRODUCTION}
 */
export function getActiveSquareEnvironment() {
  const raw = (
    process.env.REACT_APP_SQUARE_ENV ||
    process.env.REACT_APP_SQUARE_ENVIRONMENT ||
    "sandbox"
  )
    .trim()
    .toLowerCase();
  if (raw === "production" || raw === "prod") {
    return SquareEnvironment.PRODUCTION;
  }
  return SquareEnvironment.SANDBOX;
}

/**
 * Public client credentials for Web Payments SDK (fallback when API config unavailable).
 */
export function getSquareClientCredentials() {
  const environment = getActiveSquareEnvironment();
  return {
    environment,
    applicationId: pickCredential(
      environment,
      "REACT_APP_SQUARE_SANDBOX_APPLICATION_ID",
      "REACT_APP_SQUARE_PRODUCTION_APPLICATION_ID",
      "REACT_APP_SQUARE_APPLICATION_ID"
    ),
    locationId: pickCredential(
      environment,
      "REACT_APP_SQUARE_SANDBOX_LOCATION_ID",
      "REACT_APP_SQUARE_PRODUCTION_LOCATION_ID",
      "REACT_APP_SQUARE_LOCATION_ID"
    ),
    isSandbox: environment === SquareEnvironment.SANDBOX,
    isProduction: environment === SquareEnvironment.PRODUCTION,
  };
}

export function getSquareSdkUrl(environment) {
  const env = (environment || getActiveSquareEnvironment()).toLowerCase();
  return env === SquareEnvironment.PRODUCTION
    ? SQUARE_SDK_URLS.production
    : SQUARE_SDK_URLS.sandbox;
}

export function isSquarePaymentsEnabled() {
  const provider = (
    process.env.REACT_APP_PAYMENT_PROVIDER || "square"
  ).toLowerCase();
  return provider === "square" || provider === "square_sandbox";
}

/**
 * Merge API config with local fallbacks from this file.
 * @param {object} apiConfig - response from /payments/square/config
 */
export function mergeSquareConfig(apiConfig) {
  const fallback = getSquareClientCredentials();
  if (!apiConfig?.squareEnabled) {
    return apiConfig;
  }
  const environment =
    apiConfig.environment || fallback.environment || SquareEnvironment.SANDBOX;
  return {
    ...apiConfig,
    environment,
    applicationId: apiConfig.applicationId || fallback.applicationId,
    locationId: apiConfig.locationId || fallback.locationId,
  };
}
