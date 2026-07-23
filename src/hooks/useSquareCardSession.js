import { useCallback, useEffect, useRef, useState } from "react";
import {
  destroyCard,
  initializeSquareCard,
  tokenizeSquareCard,
  waitUntilElementVisible,
} from "../services/squareCardService";
import { fetchSquareConfig, isSquareEnabled } from "../services/squareConfigService";

/**
 * Manages one Square card mount for a checkout session.
 * Tokenize while the container is mounted (e.g. before leaving the payment step).
 */
export default function useSquareCardSession({
  enabled,
  containerRef,
  getVerificationDetails,
}) {
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const mountGenRef = useRef(0);
  const getVerificationRef = useRef(getVerificationDetails);
  getVerificationRef.current = getVerificationDetails;

  const mount = useCallback(async () => {
    const gen = ++mountGenRef.current;
    setPhase("loading");
    setError(null);

    try {
      const config = await fetchSquareConfig();
      if (!isSquareEnabled(config)) {
        throw new Error("Square is not enabled for this environment.");
      }
      const el = containerRef.current;
      if (!el || gen !== mountGenRef.current) return;

      await waitUntilElementVisible(el);
      if (gen !== mountGenRef.current) return;

      const initialPostalCode =
        getVerificationRef.current?.()?.billingContact?.postalCode || "";
      await initializeSquareCard(el, { initialPostalCode });
      if (gen !== mountGenRef.current) return;

      setPhase("ready");
    } catch (err) {
      if (gen !== mountGenRef.current) return;
      const message = err?.message || "Failed to load secure card field.";
      setError(message);
      setPhase("error");
    }
  }, [containerRef]);

  useEffect(() => {
    if (!enabled) {
      mountGenRef.current += 1;
      destroyCard();
      setPhase("idle");
      setError(null);
      return undefined;
    }

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => mount());
    });

    return () => {
      cancelAnimationFrame(id);
      mountGenRef.current += 1;
      destroyCard();
    };
  }, [enabled, mount]);

  const tokenize = useCallback(async () => {
    if (phase !== "ready") {
      throw new Error(
        phase === "loading"
          ? "Card field is still loading. Please wait a moment."
          : "Card field is not ready. Use Retry or refresh the page."
      );
    }
    const verificationDetails = getVerificationRef.current?.();
    if (!verificationDetails?.billingContact?.postalCode) {
      throw new Error("Billing ZIP code is required.");
    }
    if (!verificationDetails?.billingContact?.givenName) {
      throw new Error("Cardholder name is required.");
    }
    return tokenizeSquareCard({ verificationDetails });
  }, [phase]);

  const retry = useCallback(() => {
    mountGenRef.current += 1;
    destroyCard({ immediate: true }).then(() => mount());
  }, [mount]);

  return {
    phase,
    error,
    isReady: phase === "ready",
    isLoading: phase === "loading",
    tokenize,
    retry,
  };
}
