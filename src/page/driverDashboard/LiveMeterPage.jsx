import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Typography, CircularProgress, Alert, Button, Divider,
  LinearProgress, Avatar, Chip,
} from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import AccessTimeIcon          from "@mui/icons-material/AccessTime";
import AttachMoneyIcon         from "@mui/icons-material/AttachMoney";
import StopCircleIcon          from "@mui/icons-material/StopCircle";
import CheckCircleIcon         from "@mui/icons-material/CheckCircle";
import SpeedIcon               from "@mui/icons-material/Speed";
import ArrowBackIcon           from "@mui/icons-material/ArrowBack";
import WarningAmberIcon        from "@mui/icons-material/WarningAmber";
import TimerIcon               from "@mui/icons-material/Timer";
import LockClockIcon           from "@mui/icons-material/LockClock";
import ReceiptLongIcon         from "@mui/icons-material/ReceiptLong";
import { useParams, useNavigate } from "react-router-dom";
import BACKEND_API from "../../store/utils/API";
import { authHeader } from "../../util/authUtil";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const pad = (n) => String(n).padStart(2, "0");

function formatElapsed(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : `${h}h ${pad(m)}m`;
}

/* ── ElapsedClock ────────────────────────────────────────────────────────── */

function ElapsedClock({ startTime, label = "Elapsed time", color = "#f59e0b", baseOffsetSeconds = 0 }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.max(0, baseOffsetSeconds + Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime, baseOffsetSeconds]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <Box sx={{ textAlign: "center", my: 2 }}>
      <Typography sx={{
        fontFamily: "monospace", fontSize: { xs: 52, sm: 72 }, fontWeight: 800,
        color, letterSpacing: 4, lineHeight: 1,
        textShadow: `0 0 40px ${color}66`,
      }}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13, mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ── StatCard ────────────────────────────────────────────────────────────── */

function StatCard({ icon, label, value, accent }) {
  return (
    <Box sx={{
      bgcolor: accent ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.04)",
      border: accent ? "1px solid rgba(167,139,250,0.2)" : "none",
      borderRadius: 2, p: 1.5, textAlign: "center",
    }}>
      {icon}
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 10, mt: 0.5 }}>{label}</Typography>
      <Typography sx={{ color: accent ? "#c4b5fd" : "#fff", fontWeight: 700, fontSize: 14 }}>{value}</Typography>
    </Box>
  );
}

/* ── LiveMeterPage ───────────────────────────────────────────────────────── */

export default function LiveMeterPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [status,  setStatus]  = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending,  setEnding]  = useState(false);
  const [done,    setDone]    = useState(null);
  const [error,   setError]   = useState(null);
  const pollRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await BACKEND_API.get(`/api/v1/hourly-charter-books/${id}/live-status`, authHeader());
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch status.");
    }
  }, [id]);

  const fetchBooking = useCallback(async () => {
    try {
      const { data } = await BACKEND_API.get(`/api/v1/hourly-charter-books/${id}`, authHeader());
      setBooking(data);
    } catch (_) {}
  }, [id]);

  useEffect(() => {
    Promise.all([fetchBooking(), fetchStatus()]).finally(() => setLoading(false));
    pollRef.current = setInterval(fetchStatus, 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchBooking, fetchStatus]);

  const handleEndTrip = async () => {
    if (!window.confirm("End this trip and finalize billing?")) return;
    setEnding(true);
    try {
      const { data } = await BACKEND_API.patch(`/api/v1/hourly-charter-books/${id}/end-trip`, {}, authHeader());
      clearInterval(pollRef.current);
      setDone(data);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to end trip.");
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", background: "#0f0f1a" }}>
        <CircularProgress sx={{ color: "#f59e0b" }} />
      </Box>
    );
  }

  /* ── derive display values ─────────────────────────────────────────────── */
  const isExtended  = status?.mode === "EXTENDED";
  const isConverted = status?.mode === "CONVERTED";
  const isOvertime  = status?.isOvertime || isExtended;
  const bookedHours = status?.bookedHours || booking?.selectedHours || 0;

  // Progress bar: extended trips are always "overtime"
  const progressPct = isExtended
    ? 100
    : bookedHours > 0
      ? Math.min(100, ((status?.elapsedHoursRaw || 0) / bookedHours) * 100)
      : 0;

  // Which clock to display
  const clockStart = isExtended
    ? (booking?.liveExtensionStartedAt || status?.liveExtensionStartedAt)
    : booking?.actualStartTime;

  const clockLabel = isExtended ? "Total time (live)" : "Elapsed time";
  const clockColor = isExtended ? "#a78bfa" : "#f59e0b";
  // Clock starts from the booked hours already used under the fixed rate,
  // then keeps ticking up through the extension, instead of resetting to zero.
  const clockBaseOffsetSeconds = isExtended ? bookedHours * 3600 : 0;

  // Stat row values
  const totalElapsedMinutes = status?.totalElapsedMinutes ?? (bookedHours * 60 + (status?.extensionMinutes || 0));
  const elapsedDisplay = isExtended
    ? formatElapsed(totalElapsedMinutes)
    : formatElapsed(status?.elapsedMinutes || 0);

  const runningFare = status?.runningFare || 0;
  const baseFare    = status?.baseFare    || 0;
  const extFare     = status?.extensionFare || 0;

  /* ── mode badge ────────────────────────────────────────────────────────── */
  const modeBadge = isExtended
    ? { label: "EXTENDED LIVE", color: "#c4b5fd", bg: "rgba(167,139,250,0.15)", icon: <TimerIcon sx={{ fontSize: 13 }} /> }
    : isConverted
    ? { label: "CONVERTED LIVE", color: "#93c5fd", bg: "rgba(147,197,253,0.12)", icon: <SpeedIcon sx={{ fontSize: 13 }} /> }
    : { label: "LIVE METER",    color: "#f59e0b", bg: "rgba(245,158,11,0.15)",   icon: <SpeedIcon sx={{ fontSize: 13 }} /> };

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f0f1a", p: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/driver")}
        sx={{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: 13 }}>
        Back to Dashboard
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Completion banner ───────────────────────────────────────────── */}
      {done && (
        <Box sx={{ background: "linear-gradient(135deg, #065f46, #047857)", borderRadius: 3, p: 3, mb: 3, textAlign: "center" }}>
          <CheckCircleIcon sx={{ color: "#6ee7b7", fontSize: 48, mb: 1 }} />
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>Trip Completed</Typography>
          <Typography sx={{ color: "#6ee7b7", fontSize: 14, mt: 0.5 }}>Billing finalized and payment reconciled</Typography>

          {done.liveExtensionFareInDollars > 0 && (
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 2, flexWrap: "wrap" }}>
              <Chip label={`Base: $${Number(done.liveExtensionBaseFare).toFixed(2)}`}
                size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700 }} />
              <Chip label={`Extension: +$${Number(done.liveExtensionFareInDollars).toFixed(2)}`}
                size="small" sx={{ bgcolor: "rgba(167,139,250,0.3)", color: "#c4b5fd", fontWeight: 700 }} />
            </Box>
          )}
          {done.overtimeHours > 0 && !done.liveExtensionStartedAt && (
            <Chip label={`+${done.overtimeHours}h past booked hours`} size="small"
              sx={{ bgcolor: "#f59e0b22", color: "#fcd34d", mt: 1.5, fontWeight: 700 }} />
          )}
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 28, mt: 2 }}>
            ${Number(done.totalTripFeeInDollars).toFixed(2)}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Final total charged</Typography>
        </Box>
      )}

      {/* ── Main card ───────────────────────────────────────────────────── */}
      <Box sx={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                 border: "1px solid rgba(245,158,11,0.2)", borderRadius: 3, p: 2.5, mb: 2 }}>

        {/* header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: "#f59e0b22", width: 48, height: 48 }}>
            <DirectionsCarFilledIcon sx={{ color: "#f59e0b", fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              {booking?.Car?.carName || "Vehicle"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              #{booking?.confirmationNumber}
            </Typography>
          </Box>
          <Chip label={modeBadge.label} size="small" icon={modeBadge.icon}
            sx={{ ml: "auto", bgcolor: modeBadge.bg, color: modeBadge.color, fontWeight: 700, fontSize: 11 }} />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

        {/* Base fare row for extended mode */}
        {isExtended && !done && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1,
                     p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <LockClockIcon sx={{ color: "#c4b5fd", fontSize: 18 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Original fixed fare (paid)</Typography>
              <Typography sx={{ color: "#c4b5fd", fontWeight: 700, fontSize: 15 }}>
                ${baseFare.toFixed(2)} · {bookedHours}h booked
              </Typography>
            </Box>
            <ReceiptLongIcon sx={{ color: "rgba(255,255,255,0.2)", fontSize: 18 }} />
          </Box>
        )}

        {/* Clock */}
        {clockStart && !done && (
          <ElapsedClock startTime={clockStart} label={clockLabel} color={clockColor} baseOffsetSeconds={clockBaseOffsetSeconds} />
        )}

        {/* Progress bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
              {isExtended ? "Total time" : "Time used"}
            </Typography>
            <Typography sx={{
              color: isOvertime ? (isExtended ? "#c4b5fd" : "#fcd34d") : "#6ee7b7",
              fontSize: 11, fontWeight: 700,
            }}>
              {isExtended ? "LIVE EXTENSION" : isOvertime ? "OVERTIME" : `${Math.round(progressPct)}%`}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min(100, progressPct)}
            sx={{
              height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: isExtended ? "#a78bfa" : isOvertime ? "#f59e0b" : "#10b981",
              },
            }} />
        </Box>

        {/* Stat grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
          <StatCard
            icon={<AccessTimeIcon sx={{ color: "#f59e0b", fontSize: 18 }} />}
            label="Booked"
            value={`${bookedHours}h`}
          />
          <StatCard
            icon={<AccessTimeIcon sx={{ color: isOvertime ? (isExtended ? "#c4b5fd" : "#fcd34d") : "#6ee7b7", fontSize: 18 }} />}
            label={isExtended ? "Total Time" : "Elapsed"}
            value={elapsedDisplay}
          />
          <StatCard
            icon={<AttachMoneyIcon sx={{ color: "#60a5fa", fontSize: 18 }} />}
            label={isExtended ? "Total Est." : "Running Fare"}
            value={`$${runningFare.toFixed(2)}`}
          />
        </Box>

        {/* Extension fare row */}
        {isExtended && extFare > 0 && !done && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                     mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: "rgba(167,139,250,0.08)",
                     border: "1px solid rgba(167,139,250,0.18)" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Extension fare so far</Typography>
            <Typography sx={{ color: "#c4b5fd", fontWeight: 700, fontSize: 14 }}>
              +${extFare.toFixed(2)}
            </Typography>
          </Box>
        )}

        {/* Overtime banner (standard LIVE) */}
        {isOvertime && !isExtended && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(245,158,11,0.1)",
                     border: "1px solid rgba(245,158,11,0.3)", borderRadius: 2, p: 1.5, mt: 2 }}>
            <WarningAmberIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
            <Box>
              <Typography sx={{ color: "#fcd34d", fontWeight: 700, fontSize: 12 }}>
                Past booked hours — {status?.overtimeHours?.toFixed(2)}h over
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                Extra time billed at the same normal hourly rate
              </Typography>
            </Box>
          </Box>
        )}

        {/* Converted badge */}
        {isConverted && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(147,197,253,0.08)",
                     border: "1px solid rgba(147,197,253,0.2)", borderRadius: 2, p: 1.2, mt: 2 }}>
            <SpeedIcon sx={{ color: "#93c5fd", fontSize: 16 }} />
            <Typography sx={{ color: "#93c5fd", fontSize: 12 }}>
              Converted from fixed rate to live meter at trip start
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── End trip button ──────────────────────────────────────────────── */}
      {!done && (
        <Button fullWidth variant="contained"
          startIcon={ending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <StopCircleIcon />}
          disabled={ending}
          onClick={handleEndTrip}
          sx={{
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "#fff", fontWeight: 700, borderRadius: 2, py: 1.8, fontSize: 16, mt: 1,
            "&:hover": { background: "linear-gradient(135deg, #ef4444, #dc2626)" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}>
          {ending ? "Finalizing Billing…" : "End Trip & Finalize"}
        </Button>
      )}
    </Box>
  );
}
