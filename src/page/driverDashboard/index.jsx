import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Alert, Divider, Avatar, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Switch, Tooltip,
} from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SpeedIcon from "@mui/icons-material/Speed";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TimerIcon from "@mui/icons-material/Timer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockClockIcon from "@mui/icons-material/LockClock";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import BACKEND_API from "../../store/utils/API";
import { authHeader } from "../../util/authUtil";

/* ── status colours ──────────────────────────────────────────────────────── */

const STATUS_COLORS = {
  ACCEPTED: { bg: "#065f46", text: "#6ee7b7", label: "Accepted" },
  EN_ROUTE: { bg: "#78350f", text: "#fcd34d", label: "In Progress" },
};

const MODE_COLORS = {
  LIVE:       { bg: "#1e3a5f", text: "#93c5fd", label: "Live Meter" },
  PRE_BOOKED: { bg: "#3b1d5a", text: "#c4b5fd", label: "Fixed Rate" },
};

/* ── TripCard ────────────────────────────────────────────────────────────── */

function TripCard({ trip, onRefresh }) {
  const [actioning, setActioning]   = useState(false);
  const [extending, setExtending]   = useState(false);
  const [startDialog, setStartDialog] = useState(false);
  const [convertToLive, setConvertToLive] = useState(false);
  const navigate = useNavigate();

  const status    = STATUS_COLORS[trip.bookingStatus] || STATUS_COLORS.ACCEPTED;
  const modeColor = MODE_COLORS[trip.billingMode]     || MODE_COLORS.LIVE;
  const isEnRoute = trip.bookingStatus === "EN_ROUTE";
  const isLive    = trip.billingMode === "LIVE";
  const hasExtension = Boolean(trip.liveExtensionStartedAt);
  const wasConverted = Boolean(trip.convertedToLiveAt);

  /* open live meter (EN_ROUTE + LIVE) */
  const openMeter = () => navigate(`/driver/live-meter/${trip.hourlyCharterBookId}`);

  /* start trip */
  const handleStart = async () => {
    setActioning(true);
    setStartDialog(false);
    try {
      await BACKEND_API.patch(
        `/api/v1/hourly-charter-books/${trip.hourlyCharterBookId}/start-trip`,
        { convertToLive },
        authHeader()
      );
      onRefresh();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to start trip.");
    } finally {
      setActioning(false);
    }
  };

  /* extend with live meter */
  const handleExtend = async () => {
    if (!window.confirm(
      `Extend "${trip.Car?.carName}" booking with a live meter?\n\nThe original fixed fare ($${Number(trip.totalTripFeeInDollars).toFixed(2)}) is kept and additional time will be billed at live rates.`
    )) return;
    setExtending(true);
    try {
      await BACKEND_API.patch(
        `/api/v1/hourly-charter-books/${trip.hourlyCharterBookId}/extend-live`,
        {},
        authHeader()
      );
      onRefresh();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to extend trip.");
    } finally {
      setExtending(false);
    }
  };

  return (
    <>
      <Card sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid rgba(245,158,11,0.15)",
        borderRadius: 3, overflow: "visible", height: "100%",
        display: "flex", flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(245,158,11,0.15)" },
      }}>
        <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>

          {/* ── header ─────────────────────────────────────────── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "#f59e0b22", width: 44, height: 44 }}>
                <DirectionsCarFilledIcon sx={{ color: "#f59e0b" }} />
              </Avatar>
              <Box>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  {trip.Car?.carName || "Vehicle"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                  #{trip.confirmationNumber}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, alignItems: "flex-end" }}>
              <Chip label={status.label} size="small"
                sx={{ bgcolor: status.bg, color: status.text, fontWeight: 700, fontSize: 11 }} />
              <Chip
                icon={isLive
                  ? <SpeedIcon sx={{ fontSize: "13px !important", color: `${modeColor.text} !important` }} />
                  : <LockClockIcon sx={{ fontSize: "13px !important", color: `${modeColor.text} !important` }} />
                }
                label={hasExtension ? "Extended Live" : modeColor.label}
                size="small"
                sx={{ bgcolor: modeColor.bg, color: modeColor.text, fontWeight: 600, fontSize: 10 }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 2 }} />

          {/* ── route (left column) + trip meta (right column) ──── */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 3, minWidth: 0 }}>
              {[
                { icon: <LocationOnIcon sx={{ color: "#f59e0b", fontSize: 16, mt: 0.2 }} />, label: "Pickup",  val: trip.pickupPhysicalAddress },
                { icon: <LocationOnIcon sx={{ color: "#60a5fa", fontSize: 16, mt: 0.2 }} />, label: "Dropoff", val: trip.dropoffPhysicalAddress },
              ].map(({ icon, label, val }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  {icon}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{label}</Typography>
                    <Typography sx={{ color: "#fff", fontSize: 13 }} noWrap title={val}>{val}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ width: "1px", bgcolor: "rgba(255,255,255,0.08)", display: { xs: "none", sm: "block" } }} />

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.8, flex: 2, minWidth: 0, maxWidth: "100%" }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: "14px !important", color: "#f59e0b !important" }} />}
                label={`${trip.selectedHours}h booked`}
                size="small"
                sx={{
                  bgcolor: "rgba(245,158,11,0.1)", color: "#fcd34d", fontWeight: 600, fontSize: 11,
                  border: "1px solid rgba(245,158,11,0.25)", maxWidth: "100%",
                  "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                }}
              />
              <Chip
                icon={<ReceiptLongIcon sx={{ fontSize: "14px !important", color: "#6ee7b7 !important" }} />}
                label={`$${Number(trip.totalTripFeeInDollars || 0).toFixed(2)}${hasExtension ? " (base)" : ""}`}
                size="small"
                sx={{
                  bgcolor: "rgba(16,185,129,0.1)", color: "#fff", fontWeight: 700, fontSize: 12,
                  border: "1px solid rgba(16,185,129,0.25)", maxWidth: "100%",
                  "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                }}
              />
              {hasExtension && (
                <Tooltip title="Live extension active — additional time is being billed">
                  <Chip label="⚡ Live Extending" size="small"
                    sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#fcd34d", fontSize: 10, fontWeight: 700, height: 20 }} />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* ── action buttons ─────────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mt: "auto", pt: 2 }}>

            {/* Already EN_ROUTE + LIVE → open live meter */}
            {isEnRoute && isLive && (
              <Button fullWidth variant="contained"
                startIcon={<SpeedIcon />}
                onClick={openMeter}
                sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontWeight: 700, borderRadius: 2, py: 1.2 }}>
                Open Live Meter
              </Button>
            )}

            {/* ACCEPTED (any mode) → start trip */}
            {!isEnRoute && (
              <Button fullWidth variant="contained"
                startIcon={actioning ? undefined : <PlayArrowIcon />}
                disabled={actioning}
                onClick={() => setStartDialog(true)}
                sx={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, borderRadius: 2, py: 1.2 }}>
                {actioning ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Start Trip"}
              </Button>
            )}

            {/* EN_ROUTE + PRE_BOOKED (not yet extended) → offer live extension */}
            {isEnRoute && !isLive && !hasExtension && (
              <Button fullWidth variant="outlined"
                startIcon={extending ? undefined : <TimerIcon />}
                disabled={extending}
                onClick={handleExtend}
                sx={{ borderColor: "#a78bfa", color: "#a78bfa", fontWeight: 700, borderRadius: 2, py: 1.1,
                  "&:hover": { bgcolor: "rgba(167,139,250,0.1)", borderColor: "#c4b5fd" } }}>
                {extending ? <CircularProgress size={18} sx={{ color: "#a78bfa" }} /> : "Extend with Live Meter"}
              </Button>
            )}
          </Box>

        </CardContent>
      </Card>

      {/* ── Start-trip dialog ─────────────────────────────────── */}
      <Dialog open={startDialog} onClose={() => setStartDialog(false)}
        PaperProps={{ sx: { bgcolor: "#16213e", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)", minWidth: 340 } }}>
        <DialogTitle sx={{ color: "#fff", fontWeight: 800 }}>Start Trip</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, mb: 2 }}>
            {trip.Car?.carName} · #{trip.confirmationNumber}
          </Typography>

          {trip.billingMode === "PRE_BOOKED" && (
            <Box sx={{
              p: 2, borderRadius: 2,
              bgcolor: convertToLive ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${convertToLive ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.2s",
            }}>
              <FormControlLabel
                control={
                  <Switch checked={convertToLive} onChange={(e) => setConvertToLive(e.target.checked)}
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: convertToLive ? "#a78bfa" : "#fff" },
                         "& .MuiSwitch-track": { bgcolor: convertToLive ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.2)" } }} />
                }
                label={<Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Convert to Live Meter</Typography>}
              />
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12, mt: 0.5, pl: 0.5 }}>
                {convertToLive
                  ? "The live clock starts now. Final fare is billed by actual time used."
                  : `Fixed rate: $${Number(trip.totalTripFeeInDollars || 0).toFixed(2)} for ${trip.selectedHours}h. Trip runs at flat rate.`}
              </Typography>
            </Box>
          )}

          {trip.billingMode === "LIVE" && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Typography sx={{ color: "#6ee7b7", fontSize: 13 }}>
                Live meter will start. Fare is billed by actual time used.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setStartDialog(false)} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleStart}
            sx={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, borderRadius: 2, px: 3 }}>
            Start
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ── DriverDashboard ─────────────────────────────────────────────────────── */

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [trips, setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const loadTrips = useCallback(async () => {
    try {
      const { data } = await BACKEND_API.get(
        "/api/v1/hourly-charter-books/driver/active-trips",
        authHeader()
      );
      setTrips(data);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
    const interval = setInterval(loadTrips, 30000);
    return () => clearInterval(interval);
  }, [loadTrips]);

  const liveTrips  = trips.filter((t) => t.billingMode === "LIVE");
  const fixedTrips = trips.filter((t) => t.billingMode === "PRE_BOOKED");

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f0f1a", p: { xs: 2, md: 4 } }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", width: 52, height: 52 }}>
          <DirectionsCarFilledIcon sx={{ color: "#1a1a2e", fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Driver Dashboard</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {trips.length} active trip{trips.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<HistoryIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate("/driver/history")}
            sx={{ color: "#a78bfa", borderColor: "#a78bfa33", fontSize: 12 }}>
            History
          </Button>
          <Button size="small" variant="outlined" onClick={loadTrips}
            sx={{ color: "#f59e0b", borderColor: "#f59e0b33", fontSize: 12 }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress sx={{ color: "#f59e0b" }} /></Box>}
      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && trips.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 8, p: 4, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 3 }}>
          <DirectionsCarFilledIcon sx={{ color: "rgba(255,255,255,0.15)", fontSize: 56, mb: 2 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>No active trips right now</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 13, mt: 0.5 }}>
            Accepted or in-progress bookings will appear here
          </Typography>
        </Box>
      )}

      <Box sx={{ maxWidth: 1600, mx: "auto" }}>

        {/* Live meter trips */}
        {liveTrips.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <SpeedIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
              <Typography sx={{ color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Live Meter Trips
              </Typography>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 2.5,
            }}>
              {liveTrips.map((trip) => (
                <TripCard key={trip.hourlyCharterBookId} trip={trip} onRefresh={loadTrips} />
              ))}
            </Box>
          </Box>
        )}

        {/* Fixed-rate trips */}
        {fixedTrips.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <LockClockIcon sx={{ color: "#c4b5fd", fontSize: 16 }} />
              <Typography sx={{ color: "#c4b5fd", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Fixed Rate Trips
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", ml: 0.5 }}>
                — can be converted to live or extended
              </Typography>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 2.5,
            }}>
              {fixedTrips.map((trip) => (
                <TripCard key={trip.hourlyCharterBookId} trip={trip} onRefresh={loadTrips} />
              ))}
            </Box>
          </Box>
        )}

      </Box>
    </Box>
  );
}
