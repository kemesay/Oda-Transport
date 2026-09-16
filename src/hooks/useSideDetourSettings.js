import { useEffect, useState } from "react";
import { BACKEND_API } from "../store/utils/API";

const DEFAULT_SETTINGS = { isActive: false, startFee: 0 };

/**
 * Public settings for the optional side-pick-detour fee (off/$0 unless an
 * admin has turned it on) — any booking form needs this, guest or signed in,
 * to preview a fare that matches what the backend will actually charge.
 *
 * Fetched quietly (no toast on failure, like the gratuity/car catalog
 * fetches elsewhere in this form) — a brief hiccup here should never
 * interrupt someone mid-booking; it just falls back to "no fee" until the
 * next successful fetch.
 */
export default function useSideDetourSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    BACKEND_API.get("/api/v1/side-detour-settings")
      .then((res) => {
        if (cancelled) return;
        setSettings({
          isActive: Boolean(res.data?.isActive),
          startFee: Number(res.data?.startFee) || 0,
        });
      })
      .catch(() => {
        /* keep default (no fee) — a guest mid-booking shouldn't see an error */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
