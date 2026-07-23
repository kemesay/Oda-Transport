import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Chip, CircularProgress, Alert, Button, Divider,
} from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import LocationOnIcon         from "@mui/icons-material/LocationOn";
import CalendarTodayIcon      from "@mui/icons-material/CalendarToday";
import ReceiptLongIcon        from "@mui/icons-material/ReceiptLong";
import HistoryIcon            from "@mui/icons-material/History";
import ArrowBackIcon          from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import BACKEND_API from "../../store/utils/API";
import { authHeader } from "../../util/authUtil";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  COMPLETED: { label: "Completed", color: "#6ee7b7", bg: "#065f46" },
  CANCELLED: { label: "Cancelled", color: "#fca5a5", bg: "#7f1d1d" },
  REJECTED:  { label: "Rejected",  color: "#fca5a5", bg: "#7f1d1d" },
};

function formatDateToPacific(dateString) {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: true,
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/* ── HistoryCard ─────────────────────────────────────────────────────────── */

function HistoryCard({ trip }) {
  const status = STATUS_STYLES[trip.bookingStatus] || { label: trip.bookingStatus, color: "#94a3b8", bg: "#1e293b" };
  const fee = Number(trip.totalTripFeeInDollars || 0);

  return (
    <Box sx={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 3, p: 2.5, height: "100%", display: "flex", flexDirection: "column",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <DirectionsCarFilledIcon sx={{ color: "#a78bfa", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {trip.Car?.carName || "Vehicle"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
              #{trip.confirmationNumber}
            </Typography>
          </Box>
        </Box>
        <Chip label={status.label} size="small"
          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: 11 }} />
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 1.5 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <LocationOnIcon sx={{ color: "#f59e0b", fontSize: 16, mt: 0.2 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Pickup</Typography>
            <Typography sx={{ color: "#fff", fontSize: 13 }} noWrap title={trip.pickupPhysicalAddress}>
              {trip.pickupPhysicalAddress || "—"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <LocationOnIcon sx={{ color: "#94a3b8", fontSize: 16, mt: 0.2 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Dropoff</Typography>
            <Typography sx={{ color: "#fff", fontSize: 13 }} noWrap title={trip.dropoffPhysicalAddress}>
              {trip.dropoffPhysicalAddress || "—"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <CalendarTodayIcon sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            {formatDateToPacific(trip.pickupDateTime)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <ReceiptLongIcon sx={{ color: "#f59e0b", fontSize: 14 }} />
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
            ${fee.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── DriverHistoryPage ───────────────────────────────────────────────────── */

export default function DriverHistoryPage() {
  const navigate = useNavigate();
  const [trips, setTrips]       = useState([]);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]       = useState(null);

  const loadPage = useCallback(async (pageNumber, replace) => {
    replace ? setLoading(true) : setLoadingMore(true);
    try {
      const { data } = await BACKEND_API.get(
        `/api/v1/hourly-charter-books/driver/history?page=${pageNumber}&pageSize=10`,
        authHeader()
      );
      setTrips((prev) => (replace ? data.data : [...prev, ...data.data]));
      setPage(data.pageNumber);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load trip history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPage(1, true); }, [loadPage]);

  const hasMore = page < totalPages;

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f0f1a", p: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/driver")}
        sx={{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: 13 }}>
        Back to Dashboard
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: 2, bgcolor: "rgba(167,139,250,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <HistoryIcon sx={{ color: "#a78bfa", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Trip History</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Completed, cancelled, and rejected trips you've served
          </Typography>
        </Box>
      </Box>

      {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress sx={{ color: "#f59e0b" }} /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && trips.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 8, p: 4, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 3 }}>
          <HistoryIcon sx={{ color: "rgba(255,255,255,0.15)", fontSize: 56, mb: 2 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>No trip history yet</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 13, mt: 0.5 }}>
            Completed, cancelled, or rejected trips you served will appear here
          </Typography>
        </Box>
      )}

      {!loading && trips.length > 0 && (
        <Box sx={{ maxWidth: 1600, mx: "auto" }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 2.5, mb: 3,
          }}>
            {trips.map((trip) => (
              <HistoryCard key={trip.hourlyCharterBookId} trip={trip} />
            ))}
          </Box>

          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="outlined" disabled={loadingMore} onClick={() => loadPage(page + 1, false)}
                sx={{ color: "#f59e0b", borderColor: "#f59e0b55", fontWeight: 700 }}>
                {loadingMore ? <CircularProgress size={18} sx={{ color: "#f59e0b" }} /> : "Load More"}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
