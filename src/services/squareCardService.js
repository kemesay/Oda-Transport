import {
  fetchSquareConfig,
  getCachedSquareConfig,
  getSquareSdkUrl,
} from "./squareConfigService";

const TEARDOWN_DELAY_MS = 150;
const MOUNT_RETRY_MS = 100;
const MAX_MOUNT_RETRIES = 50;
const CARD_CONTAINER_MIN_PX = 120;
const CARD_CONTAINER_MIN_WIDTH_PX = 120;

let scriptEl = null;
let scriptEnvKey = null;
let paymentsInstance = null;
let cardInstance = null;
let mountGeneration = 0;
let teardownTimer = null;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (window.Square?.payments) {
      resolve(window.Square);
      return;
    }
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Square));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Square Web Payments SDK."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      if (!window.Square?.payments) {
        reject(new Error("Square SDK loaded but window.Square.payments is missing."));
        return;
      }
      resolve(window.Square);
    };
    script.onerror = () =>
      reject(new Error("Failed to load Square Web Payments SDK script."));
    document.head.appendChild(script);
    scriptEl = script;
  });
}

async function ensureSdk(config) {
  const envKey = `${config.environment}:${config.applicationId}`;
  const sdkUrl = getSquareSdkUrl(config.environment);

  if (scriptEnvKey && scriptEnvKey !== envKey) {
    await destroyCard({ immediate: true });
    if (scriptEl?.parentNode) {
      scriptEl.parentNode.removeChild(scriptEl);
    }
    scriptEl = null;
    delete window.Square;
  }

  scriptEnvKey = envKey;
  await loadScript(sdkUrl);
}

function ensureContainerLayout(el) {
  if (!el) return;
  el.style.width = el.style.width || "100%";
  el.style.minHeight = `${CARD_CONTAINER_MIN_PX}px`;
  el.style.boxSizing = "border-box";
}

function containerHasSize(el) {
  if (!el) return false;
  ensureContainerLayout(el);
  const rect = el.getBoundingClientRect();
  return rect.width >= CARD_CONTAINER_MIN_WIDTH_PX && rect.height >= 40;
}

/** Square injects iframes; explicit sizing avoids a blank or clipped card field. */
export function applySquareCardContainerLayout(containerEl) {
  if (!containerEl) return;
  ensureContainerLayout(containerEl);
  containerEl.querySelectorAll("iframe").forEach((iframe) => {
    iframe.style.width = "100%";
    iframe.style.minHeight = `${CARD_CONTAINER_MIN_PX}px`;
    iframe.style.border = "none";
    iframe.style.display = "block";
  });
}

async function waitForContainer(el) {
  ensureContainerLayout(el);
  for (let i = 0; i < MAX_MOUNT_RETRIES; i += 1) {
    if (containerHasSize(el)) return;
    await new Promise((r) => setTimeout(r, MOUNT_RETRY_MS));
  }
  throw new Error(
    "Payment form is still loading. Wait a moment, or choose a saved card and try again."
  );
}

/** Resolves when element has layout size (handles MUI Collapse / tab animations). */
export function waitUntilElementVisible(el, { timeoutMs = 6000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!el) {
      reject(new Error("Square card container is missing."));
      return;
    }
    ensureContainerLayout(el);

    if (containerHasSize(el)) {
      resolve();
      return;
    }

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      ok ? resolve() : reject(new Error("Payment form is still loading. Please try again."));
    };

    const observer = new ResizeObserver(() => {
      if (containerHasSize(el)) finish(true);
    });
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);

    const timer = setTimeout(() => finish(containerHasSize(el)), timeoutMs);
  });
}

export async function configureSquareCard(options = {}) {
  if (!cardInstance) return;
  await cardInstance.configure(options);
}

export async function initializeSquareCard(
  containerEl,
  { initialPostalCode } = {}
) {
  const config = getCachedSquareConfig() || (await fetchSquareConfig());
  if (!config?.squareEnabled) {
    throw new Error("Square payments are not enabled on this server.");
  }

  await ensureSdk(config);
  const generation = ++mountGeneration;

  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }

  if (cardInstance) {
    try {
      await cardInstance.destroy();
    } catch (_) {
      /* ignore stale instance */
    }
    cardInstance = null;
  }

  await waitForContainer(containerEl);

  if (generation !== mountGeneration) {
    throw new Error("Square card mount was superseded.");
  }

  paymentsInstance = window.Square.payments(
    config.applicationId,
    config.locationId
  );
  const zip = String(initialPostalCode || "").trim();
  const cardOptions = zip ? { postalCode: zip } : undefined;
  cardInstance = cardOptions
    ? await paymentsInstance.card(cardOptions)
    : await paymentsInstance.card();
  await cardInstance.attach(containerEl);
  applySquareCardContainerLayout(containerEl);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  applySquareCardContainerLayout(containerEl);

  const hasFrame = containerEl.querySelector("iframe");
  if (!hasFrame) {
    throw new Error(
      "Square card field did not render. Check network/CSP or disable blockers for squarecdn.com."
    );
  }

  return { card: cardInstance, config };
}

export async function tokenizeSquareCard({ verificationDetails } = {}) {
  if (!cardInstance) {
    throw new Error("Square card is not initialized.");
  }
  const result = await cardInstance.tokenize(verificationDetails);
  if (result.status !== "OK") {
    const message =
      result.errors?.map((e) => e.message).filter(Boolean).join(" ") ||
      "Card tokenization failed.";
    throw new Error(message);
  }
  return {
    sourceId: result.token,
    verificationToken: result.details?.card?.verificationToken || undefined,
  };
}

export async function destroyCard({ immediate = false } = {}) {
  mountGeneration += 1;

  const run = async () => {
    if (cardInstance) {
      try {
        await cardInstance.destroy();
      } catch (_) {
        /* ignore */
      }
      cardInstance = null;
    }
    paymentsInstance = null;
  };

  if (immediate) {
    if (teardownTimer) {
      clearTimeout(teardownTimer);
      teardownTimer = null;
    }
    await run();
    return;
  }

  if (teardownTimer) clearTimeout(teardownTimer);
  teardownTimer = setTimeout(() => {
    teardownTimer = null;
    run();
  }, TEARDOWN_DELAY_MS);
}
