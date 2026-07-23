import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LockClockIcon from "@mui/icons-material/LockClock";
import SpeedIcon from "@mui/icons-material/Speed";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const MODES = [
  {
    value: "PRE_BOOKED",
    icon: LockClockIcon,
    label: "Fixed Booking",
    sublabel: "Pay for booked hours only",
    tip: "You are charged exactly for the hours you book. No surprises. Best for planned events with a fixed schedule.",
    accent: "#03930A",
  },
  {
    value: "LIVE",
    icon: SpeedIcon,
    label: "Live Meter",
    sublabel: "Pay for actual time used",
    tip: "We pre-authorize your booked hours + 2 hr buffer. At trip end the meter stops — your booked hours are a minimum charge, and any extra time is billed at the same normal hourly rate.",
    accent: "#F59E0B",
  },
];

export default function BillingModeToggle({ value = "PRE_BOOKED", onChange }) {
  return (
    <Box>
      {/* Label row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Billing Mode
        </Typography>
        <Tooltip
          title="Fixed Booking charges exactly what you book. Live Meter acts like an Uber Black / limo meter — charges actual trip time with a pre-authorized buffer."
          placement="top"
          arrow
        >
          <InfoOutlinedIcon sx={{ fontSize: 15, color: "text.disabled", cursor: "help" }} />
        </Tooltip>
      </Box>

      {/* Toggle pill */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
          p: "4px",
          borderRadius: "14px",
          background: "#f1f5f1",
          border: "1px solid rgba(0,0,0,0.06)",
          position: "relative",
        }}
      >
        {MODES.map((mode) => {
          const active = value === mode.value;
          const Icon = mode.icon;
          return (
            <Tooltip key={mode.value} title={mode.tip} placement="bottom" arrow>
              <Box
                onClick={() => onChange(mode.value)}
                component={motion.div}
                whileTap={{ scale: 0.97 }}
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1.4,
                  borderRadius: "10px",
                  cursor: "pointer",
                  zIndex: 1,
                  transition: "all 0.22s ease",
                  background: active
                    ? mode.value === "LIVE"
                      ? "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)"
                      : "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                    : "transparent",
                  boxShadow: active ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
                  border: active
                    ? `1.5px solid ${mode.accent}40`
                    : "1.5px solid transparent",
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "9px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? `${mode.accent}18` : "rgba(0,0,0,0.04)",
                    transition: "all 0.22s ease",
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 18,
                      color: active ? mode.accent : "text.disabled",
                      transition: "color 0.22s ease",
                    }}
                  />
                </Box>

                {/* Text */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? mode.accent : "text.secondary",
                      lineHeight: 1.25,
                      transition: "all 0.22s ease",
                    }}
                  >
                    {mode.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      color: active ? `${mode.accent}bb` : "text.disabled",
                      lineHeight: 1.3,
                      transition: "color 0.22s ease",
                    }}
                  >
                    {mode.sublabel}
                  </Typography>
                </Box>

                {/* Active dot */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: mode.accent,
                      }}
                    />
                  )}
                </AnimatePresence>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Context note for LIVE mode */}
      <AnimatePresence>
        {value === "LIVE" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "10px",
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <SpeedIcon sx={{ color: "#F59E0B", fontSize: 15, mt: "2px", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>
                Card will be pre-authorized for your booked hours&nbsp;+&nbsp;2&nbsp;hr buffer.
                Actual charge calculated when driver ends the trip.
                Booked hours are a minimum charge; extra time billed at the{" "}
                <strong>same normal hourly rate</strong>.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
