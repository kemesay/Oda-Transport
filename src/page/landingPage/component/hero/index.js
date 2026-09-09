import React from "react";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import RSButton from "../../../../components/RSButton";
import { useNavigate } from "react-router-dom";
import {
  FlightTakeoff,
  DirectionsCar,
  AccessTime,
  Star,
  VerifiedUser,
  SupportAgent,
  BoltOutlined,
  PersonPinCircleOutlined,
  DirectionsCarFilledOutlined,
  GpsFixed,
  AttachMoney,
  CheckCircle,
  FormatQuote,
} from "@mui/icons-material";
import odaLogoWatermark from "../../../../assets/images/grayLogo-transparent.png";

/* ═══════════════════════════ keyframe animations ══════════════════════ */

const driftDots = keyframes`
  0%   { background-position: 0 0; }
  100% { background-position: 44px 44px; }
`;

const pulseGlowL = keyframes`
  0%,100% { opacity: 0.75; transform: scale(1);   }
  50%      { opacity: 1;    transform: scale(1.12); }
`;
const pulseGlowR = keyframes`
  0%,100% { opacity: 0.6;  transform: scale(1);   }
  50%      { opacity: 0.9;  transform: scale(1.1);  }
`;

const carRight = keyframes`
  0%   { transform: translateX(-160px); }
  100% { transform: translateX(1620px); }
`;
const carLeft = keyframes`
  0%   { transform: translateX(1620px) scaleX(-1); }
  100% { transform: translateX(-160px) scaleX(-1); }
`;
const dashScroll = keyframes`
  0%   { background-position: 0 0; }
  100% { background-position: -120px 0; }
`;
const lightPulse = keyframes`
  0%,100% { opacity: 0.9; }
  50%      { opacity: 0.5; }
`;

/* ═══════════════════════════ styled components ═════════════════════════ */

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  background:
    "linear-gradient(155deg, #060d1a 0%, #0a1628 40%, #0c1e38 70%, #07111f 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  padding: theme.spacing(14, 3, 0),
}));

const GlowLeft = styled(Box)({
  position: "absolute",
  top: "8%",
  left: "-8%",
  width: "60vw",
  height: "60vw",
  maxWidth: "750px",
  maxHeight: "750px",
  background: "radial-gradient(circle, rgba(3,147,10,0.15) 0%, transparent 68%)",
  zIndex: 0,
  pointerEvents: "none",
  animation: `${pulseGlowL} 8s ease-in-out infinite`,
});

const GlowRight = styled(Box)({
  position: "absolute",
  bottom: "10%",
  right: "-10%",
  width: "50vw",
  height: "50vw",
  maxWidth: "640px",
  maxHeight: "640px",
  background: "radial-gradient(circle, rgba(3,147,10,0.09) 0%, transparent 68%)",
  zIndex: 0,
  pointerEvents: "none",
  animation: `${pulseGlowR} 10s ease-in-out infinite`,
  animationDelay: "4s",
});

const DotGrid = styled(Box)({
  position: "absolute",
  inset: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='22' cy='22' r='1' fill='%23ffffff' fill-opacity='0.025'/%3E%3C/svg%3E")`,
  zIndex: 0,
  pointerEvents: "none",
  animation: `${driftDots} 40s linear infinite`,
});

const TrustBadge = styled(motion.div)({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 16px",
  borderRadius: "100px",
  border: "1px solid rgba(255,255,255,0.11)",
  backdropFilter: "blur(12px)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.82)",
  fontSize: "0.8rem",
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "default",
  transition: "all 0.2s ease",
  "&:hover": {
    border: "1px solid rgba(3,147,10,0.45)",
    background: "rgba(3,147,10,0.1)",
  },
});

const AccentUnderline = styled(Box)({
  width: "52px",
  height: "3px",
  background: "linear-gradient(90deg, #03930A, #4CB051)",
  borderRadius: "2px",
});

const ServiceTypeBtn = styled(motion.div)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  padding: theme.spacing(2.5, 2.8),
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "16px",
  cursor: "pointer",
  flex: 1,
  backdropFilter: "blur(8px)",
  transition: "all 0.25s ease",
  "&:hover": {
    background: "rgba(3,147,10,0.13)",
    borderColor: "rgba(3,147,10,0.5)",
    boxShadow: "0 6px 22px rgba(3,147,10,0.2)",
  },
}));


/* ═══════════════════════════ car SVG ══════════════════════════════════ */

function CarSvg({ color = "#1a1a2e", lightColor = "#ffe070", tailColor = "#cc2200" }) {
  return (
    <svg viewBox="0 0 96 36" width="96" height="36" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="48" cy="34" rx="40" ry="3" fill="rgba(0,0,0,0.4)" />
      {/* Body */}
      <path d="M5,23 L9,13 L26,7 L64,7 L82,13 L91,18 L91,24 L5,24 Z" fill={color} />
      {/* Cabin/roof */}
      <path d="M26,7 L30,1 L62,1 L66,7 Z" fill="#141428" />
      {/* Windshields */}
      <path d="M30,2 L26,7 L66,7 L62,2 Z" fill="rgba(130,190,255,0.3)" />
      {/* Side windows */}
      <path d="M32,2 L30,6 L46,6 L47,2 Z" fill="rgba(100,160,220,0.2)" />
      <path d="M49,2 L48,6 L62,6 L60,2 Z" fill="rgba(100,160,220,0.2)" />
      {/* Door detail */}
      <line x1="47" y1="7" x2="47" y2="23" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      {/* Front wheel arch + wheel */}
      <path d="M72,23 Q72,32 80,32 Q88,32 88,23 Z" fill={color} />
      <circle cx="80" cy="28" r="8" fill="#0c0c18" />
      <circle cx="80" cy="28" r="5" fill="#1c1c28" />
      <circle cx="80" cy="28" r="2" fill="#2e2e40" />
      {/* Rear wheel arch + wheel */}
      <path d="M10,23 Q10,32 18,32 Q26,32 26,23 Z" fill={color} />
      <circle cx="18" cy="28" r="8" fill="#0c0c18" />
      <circle cx="18" cy="28" r="5" fill="#1c1c28" />
      <circle cx="18" cy="28" r="2" fill="#2e2e40" />
      {/* Headlights (right/front) */}
      <rect x="87" y="14" width="8" height="6" rx="1.5" fill={lightColor} opacity="0.95" />
      <rect x="88" y="17" width="5" height="2.5" rx="1" fill="white" opacity="0.6" />
      {/* Tail lights (left/rear) */}
      <rect x="1" y="15" width="7" height="5" rx="1.5" fill={tailColor} opacity="0.85" />
      {/* Roof rail */}
      <rect x="30" y="0" width="32" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

/* ═══════════════════════════ road + car lane ═══════════════════════════ */

function RoadSection() {
  const cars = [
    { dir: "right", delay: "0s",   duration: "13s", lane: 8,  color: "#1a1a2e", light: "#ffe070", tail: "#cc2200" },
    { dir: "right", delay: "6.5s", duration: "17s", lane: 8,  color: "#141428", light: "#fff4aa", tail: "#bb1100" },
    { dir: "left",  delay: "2s",   duration: "15s", lane: 38, color: "#1e2035", light: "#ffe070", tail: "#dd2200" },
    { dir: "left",  delay: "9s",   duration: "11s", lane: 38, color: "#12121f", light: "#ffee88", tail: "#cc1100" },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        zIndex: 3,
        overflow: "hidden",
        background: "linear-gradient(180deg, #0a0a18 0%, #080810 100%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Sidewalk/curb top edge */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#131325" }} />

      {/* Lane divider — animated dashed center line */}
      <Box
        sx={{
          position: "absolute",
          top: "31px",
          left: 0,
          right: 0,
          height: "3px",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,200,0,0.35) 0px, rgba(255,200,0,0.35) 40px, transparent 40px, transparent 80px)",
          backgroundSize: "120px 3px",
          animation: `${dashScroll} 0.9s linear infinite`,
        }}
      />

      {/* Outer lane markings - right lane */}
      <Box
        sx={{
          position: "absolute",
          top: "17px",
          left: 0,
          right: 0,
          height: "2px",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 30px, transparent 30px, transparent 80px)",
          backgroundSize: "110px 2px",
          animation: `${dashScroll} 1.1s linear infinite`,
        }}
      />

      {/* Outer lane markings - left lane */}
      <Box
        sx={{
          position: "absolute",
          top: "46px",
          left: 0,
          right: 0,
          height: "2px",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 30px, transparent 30px, transparent 80px)",
          backgroundSize: "110px 2px",
          animation: `${dashScroll} 1.1s linear infinite`,
          animationDirection: "reverse",
        }}
      />

      {/* Road surface glow */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(3,147,10,0.03) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Animated cars */}
      {cars.map((car, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: `${car.lane}px`,
            left: 0,
            animation: `${car.dir === "right" ? carRight : carLeft} ${car.duration} linear infinite`,
            animationDelay: car.delay,
            willChange: "transform",
            transformOrigin: "center",
            ...(car.dir === "left" && { transform: "scaleX(-1)" }),
          }}
        >
          {/* Headlight glow cone */}
          {car.dir === "right" && (
            <Box
              sx={{
                position: "absolute",
                top: "10px",
                right: "-30px",
                width: "55px",
                height: "14px",
                background: "linear-gradient(90deg, transparent, rgba(255,240,100,0.12))",
                borderRadius: "0 8px 8px 0",
                animation: `${lightPulse} 2s ease-in-out infinite`,
              }}
            />
          )}
          <CarSvg color={car.color} lightColor={car.light} tailColor={car.tail} />
          {/* Tail-light glow */}
          <Box
            sx={{
              position: "absolute",
              top: "12px",
              left: "-22px",
              width: "35px",
              height: "10px",
              background: "linear-gradient(270deg, transparent, rgba(220,30,0,0.14))",
              borderRadius: "8px 0 0 8px",
            }}
          />
        </Box>
      ))}

      {/* Street-light glow dots */}
      {[180, 540, 900, 1260].map((x) => (
        <Box
          key={x}
          sx={{
            position: "absolute",
            top: 0,
            left: `${x}px`,
            width: "2px",
            height: "64px",
            background: "linear-gradient(180deg, rgba(255,200,80,0.22) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      ))}
    </Box>
  );
}

/* ═══════════════════════════ LA city skyline SVG ══════════════════════ */

function LASkyline() {
  const windows = [];
  // Wilshire Grand windows
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 5; col++) {
      if (Math.sin(row * 3 + col * 7) > 0.1) {
        windows.push({ x: 543 + col * 6, y: 40 + row * 12, key: `wg-${row}-${col}` });
      }
    }
  }
  // US Bank windows
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 4; col++) {
      if (Math.cos(row * 5 + col * 3) > 0.0) {
        windows.push({ x: 593 + col * 6, y: 56 + row * 12, key: `usb-${row}-${col}` });
      }
    }
  }
  // Gas Co Tower windows
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 3; col++) {
      if (Math.sin(row * 4 + col * 9) > 0.2) {
        windows.push({ x: 675 + col * 6, y: 68 + row * 12, key: `gc-${row}-${col}` });
      }
    }
  }

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: "64px", // sits above the road
        left: 0,
        right: 0,
        width: "100%",
        lineHeight: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "300px" }}
      >
        <defs>
          <linearGradient id="skyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#03930A" stopOpacity="0" />
            <stop offset="55%"  stopColor="#03930A" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#03930A" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="bFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="bMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="bFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
          </linearGradient>
          {/* Antenna red-light blink handled by CSS outside SVG */}
        </defs>

        {/* ── horizon city-glow ── */}
        <rect x="0" y="170" width="1440" height="130" fill="url(#skyGlow)" />

        {/* ── LAYER 1: distant suburban buildings ── */}
        <g fill="url(#bFar)">
          {[
            [0,220,44,80],[50,210,28,90],[82,215,38,85],[130,202,26,98],
            [162,210,32,90],[200,198,24,102],[232,206,36,94],[270,192,28,108],
            [1050,206,38,94],[1096,213,26,87],[1132,202,32,98],[1175,210,42,90],
            [1222,200,28,100],[1258,207,36,93],[1302,215,24,85],[1332,205,38,95],
            [1375,218,30,82],[1414,210,28,90],
          ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
        </g>

        {/* ── LAYER 2: mid-ground ── */}
        <g fill="url(#bMid)">
          {[
            [10,192,38,108],[55,178,30,122],[90,185,42,115],[140,168,28,132],
            [175,180,36,120],[220,162,32,138],[258,170,28,130],[295,155,36,145],
            [338,164,30,136],[375,148,34,152],[415,158,28,142],[452,140,32,160],
            [488,152,26,148],
            // right side
            [905,148,34,152],[942,158,30,142],[980,145,36,155],[1025,165,28,135],
            [1060,155,32,145],[1098,175,26,125],[1132,165,38,135],[1177,178,30,122],
            [1214,168,34,132],[1256,185,28,115],[1294,178,32,122],[1336,190,26,110],
            [1368,200,38,100],[1412,196,32,104],
          ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
        </g>

        {/* ── LAYER 3: foreground downtown towers ── */}
        <g fill="url(#bFront)">
          {/* City Hall - stepped pyramid */}
          <rect x="272" y="138" width="48" height="162" />
          <rect x="282" y="120" width="28" height="20" />
          <rect x="289" y="104" width="14" height="18" />
          <rect x="293" y="92"  width="6"  height="14" />
          {/* Pre-DTLA towers */}
          <rect x="315" y="145" width="38" height="155" />
          <rect x="360" y="130" width="30" height="170" />
          <rect x="398" y="118" width="34" height="182" />
          <rect x="440" y="102" width="30" height="198" />
          <rect x="477" y="86"  width="32" height="214" />
          <rect x="516" y="68"  width="28" height="232" />
          {/* ── THE WILSHIRE GRAND — tallest, with fin ── */}
          <rect x="540" y="28"  width="36" height="272" />
          {/* Fin / sail crown */}
          <polygon points="556,28 576,28 576,5 564,0" fill="rgba(255,255,255,0.16)" />
          {/* Antenna */}
          <rect x="563" y="0"   width="2"  height="12" fill="rgba(255,255,255,0.3)" />
          {/* ── US BANK TOWER with crown ── */}
          <rect x="592" y="48"  width="30" height="252" />
          {/* Crown cylinder */}
          <rect x="595" y="38"  width="24" height="14" />
          <rect x="599" y="30"  width="16" height="10" />
          <rect x="604" y="24"  width="6"  height="8"  />
          {/* ── AON CENTER ── */}
          <rect x="636" y="62"  width="28" height="238" />
          {/* ── GAS CO TOWER — pyramid top ── */}
          <rect x="676" y="55"  width="26" height="245" />
          <polygon points="676,55 702,55 689,36" fill="rgba(255,255,255,0.12)" />
          {/* ── 1100 Wilshire ── */}
          <rect x="715" y="78"  width="26" height="222" />
          {/* ── 777 Tower — with crown ── */}
          <rect x="752" y="68"  width="28" height="232" />
          <polygon points="752,68 780,68 766,48" fill="rgba(255,255,255,0.11)" />
          {/* ── Other financial towers ── */}
          <rect x="794" y="88"  width="26" height="212" />
          <rect x="832" y="76"  width="30" height="224" />
          <rect x="872" y="96"  width="28" height="204" />
          {/* Right cluster */}
          <rect x="912" y="106" width="30" height="194" />
          <rect x="952" y="98"  width="28" height="202" />
        </g>

        {/* ── window lights ── */}
        {windows.map(({ x, y, key }) => (
          <rect key={key} x={x} y={y} width="3" height="3" fill="rgba(255,248,200,0.22)" />
        ))}

        {/* ── a few "lit" windows slightly brighter ── */}
        <rect x="548" y="52"  width="3" height="3" fill="rgba(255,248,200,0.5)" />
        <rect x="560" y="76"  width="3" height="3" fill="rgba(255,248,200,0.5)" />
        <rect x="600" y="60"  width="3" height="3" fill="rgba(255,248,200,0.5)" />
        <rect x="643" y="90"  width="3" height="3" fill="rgba(255,248,200,0.5)" />

        {/* ── rooftop antenna/warning lights ── */}
        <circle cx="564" cy="0"  r="2.5" fill="rgba(255,60,60,0.85)" />
        <circle cx="607" cy="24" r="2"   fill="rgba(255,60,60,0.7)" />
        <circle cx="689" cy="34" r="2"   fill="rgba(255,60,60,0.65)" />

        {/* ── ground / base line ── */}
        <rect x="0" y="298" width="1440" height="2" fill="rgba(255,255,255,0.06)" />
      </svg>
    </Box>
  );
}

/* ═══════════════════════════ static data ══════════════════════════════ */

const serviceTypes = [
  { id: 1, label: "Airport Service",  sublabel: "All CA airports",   icon: FlightTakeoff, path: "/home/1" },
  { id: 2, label: "Point to Point",   sublabel: "City & business",    icon: DirectionsCar, path: "/home/2" },
  { id: 3, label: "Hourly Charter",   sublabel: "Events & tours",     icon: AccessTime,    path: "/home/3" },
];

// const trustBadges = [
//   { icon: Star,        label: "5★ Rated Service" },
//   { icon: VerifiedUser,label: "CA Licensed & Insured" },
//   { icon: SupportAgent,label: "24/7 Available" },
// ];

const adFeatures = [
  {
    icon: BoltOutlined,
    title: "Instant Booking",
    desc: "Reserve your ride in under 60 seconds — anytime, anywhere.",
  },
  {
    icon: PersonPinCircleOutlined,
    title: "Professional Chauffeurs",
    desc: "Fully licensed, background-checked & always on time.",
  },
  {
    icon: DirectionsCarFilledOutlined,
    title: "Modern Luxury Fleet",
    desc: "Premium sedans, executive SUVs — immaculate & equipped.",
  },
  {
    icon: GpsFixed,
    title: "Real-Time Tracking",
    desc: "Live driver updates from dispatch to your door.",
  },
  {
    icon: AttachMoney,
    title: "Fixed, Transparent Rates",
    desc: "No surge pricing. No hidden fees. Ever.",
  },
];

/* ═══════════════════════════ Hero ══════════════════════════════════════ */

function Hero({ onLoginClick }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.15 } },
  };
  const itemUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };
  const itemRight = {
    hidden:  { opacity: 0, x: 30 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" },
    }),
  };

  return (
    <HeroContainer>
      {/* ── atmospheric layers ── */}
      <GlowLeft />
      <GlowRight />
      <DotGrid />

      {/* ── ODA logo watermark ── */}
      <Box
        component="img"
        src={odaLogoWatermark}
        alt=""
        aria-hidden="true"
        sx={{
          position: "absolute",
          right: { xs: "-10%", md: "2%" },
          top: "48%",
          transform: "translateY(-50%)",
          width: { xs: "72%", md: "36%" },
          maxWidth: "540px",
          opacity: 0.055,
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
      />

      {/* ── main content grid ── */}
      <Box
        sx={{
          zIndex: 2,
          width: "100%",
          maxWidth: "1320px",
          px: { xs: 1, md: 4 },
          pb: "390px",   // clears skyline (300px) + road (64px) + margin
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 380px" },
          gap: { xs: 4, md: 6 },
          alignItems: "center",
        }}
      >
        {/* ── LEFT: text content ── */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <Stack spacing={3.5}>

            {/* Trust badges */}
            <motion.div variants={itemUp}>
              {/* <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.2 }}>
                {trustBadges.map(({ icon: Icon, label }) => (
                  <TrustBadge key={label}>
                    <Icon sx={{ fontSize: 14, color: "#4CB051" }} />
                    <span>{label}</span>
                  </TrustBadge>
                ))}
              </Stack> */}
            </motion.div>

            {/* Headline — CA → USA */}
            <motion.div variants={itemUp}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "2.6rem", sm: "3.6rem", md: "4.5rem", lg: "5.2rem" },
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: "#ffffff",
                  letterSpacing: { xs: "-0.5px", md: "-2px" },
                }}
              >
                ODA Black Car Service
              </Typography>
              {/* Nationwide coverage badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.2,
                  mt: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: "100px",
                  background: "rgba(3,147,10,0.12)",
                  border: "1px solid rgba(3,147,10,0.3)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.28rem", md: "1.4rem" },
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #4CB051, #03930A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Nationwide
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.28rem", md: "1.4rem" },
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Pickup & Drop-off Anywhere in the USA
                </Typography>
              </Box>
            </motion.div>

            <motion.div variants={itemUp}>
              <AccentUnderline />
            </motion.div>

            {/* Subheadline */}
            <motion.div variants={itemUp}>
              <Typography
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.18rem", md: "1.28rem" },
                  color: "rgba(255,255,255,0.62)",
                  maxWidth: "540px",
                  lineHeight: 1.85,
                }}
              >
                Pickup and drop-off{" "}
                <strong style={{ color: "#4CB051" }}>
                  anywhere in the United States
                </strong>{" "}
                airport transfers, corporate rides & city tours reaching
                every corner of the{" "}
                <strong style={{ color: "rgba(255,255,255,0.82)" }}>
                  country.
                </strong>
              </Typography>
            </motion.div>

            {/* Primary CTA */}
            <motion.div variants={itemUp}>
              <RSButton
                onClick={onLoginClick}
                backgroundcolor="success.main"
                sx={{
                  px: { xs: 5, sm: 7 },
                  py: { xs: 1.6, sm: 1.9 },
                  fontSize: { xs: "1.08rem", sm: "1.2rem" },
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 22px rgba(3,147,10,0.42)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 36px rgba(3,147,10,0.58)",
                  },
                }}
              >
                Book Your Ride Now
              </RSButton>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemUp}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", letterSpacing: "0.4px" }}>
                  choose a service
                </Typography>
                <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              </Box>
            </motion.div>

            {/* Service type quick-select */}
            <motion.div variants={itemUp}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {serviceTypes.map(({ id, label, sublabel, icon: Icon, path }) => (
                  <ServiceTypeBtn
                    key={id}
                    onClick={() => navigate(path)}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: "rgba(3,147,10,0.18)",
                        border: "1px solid rgba(3,147,10,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: "#4CB051", fontSize: 23 }} />
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ color: "rgba(255,255,255,0.88)", fontSize: "0.97rem", fontWeight: 600 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.38)", fontSize: "0.82rem" }}>
                        {sublabel}
                      </Typography>
                    </Box>
                  </ServiceTypeBtn>
                ))}
              </Stack>
            </motion.div>
          </Stack>
        </motion.div>

        {/* ── RIGHT: advertisement panel (desktop only) ── */}
        {!isMobile && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut", delay: 0.2 } } }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: "20px",
                border: "1px solid rgba(3,147,10,0.2)",
                background: "linear-gradient(145deg, rgba(10,22,40,0.85) 0%, rgba(6,15,28,0.92) 100%)",
                backdropFilter: "blur(22px)",
                overflow: "hidden",
                p: 3.5,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #03930A, #4CB051, transparent)",
                },
              }}
            >
              {/* Corner glow accent */}
              <Box sx={{
                position: "absolute", top: -40, right: -40,
                width: 120, height: 120,
                background: "radial-gradient(circle, rgba(3,147,10,0.2) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Quote icon */}
              <FormatQuote sx={{ color: "rgba(3,147,10,0.25)", fontSize: 48, mb: -1, ml: -0.5 }} />

              {/* Ad headline */}
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  lineHeight: 1.22,
                  color: "#ffffff",
                  mb: 0.5,
                  letterSpacing: "-0.5px",
                }}
              >
                Fast, Easy &{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(90deg, #4CB051, #03930A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Accurate
                </Box>{" "}
                Transportation
              </Typography>

              {/* Ad sub-copy */}
              <Typography
                sx={{
                  fontSize: "0.97rem",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.78,
                  mb: 2.5,
                  maxWidth: "340px",
                }}
              >
                Looking for an easy and fast way to manage your transportation?
                Look no further —{" "}
                <Box component="span" sx={{ color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
                  ODA Black Car Service
                </Box>{" "}
                delivers premium rides with professional chauffeurs and a modern,
                immaculate fleet.
              </Typography>

              {/* Divider */}
              <Box sx={{ height: "1px", background: "rgba(255,255,255,0.07)", mb: 2.5 }} />

              {/* Feature list */}
              <Stack spacing={1.8}>
                {adFeatures.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.09 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.6 }}>
                      <Box
                        sx={{
                          mt: "2px",
                          minWidth: 32,
                          height: 32,
                          borderRadius: "9px",
                          background: "rgba(3,147,10,0.14)",
                          border: "1px solid rgba(3,147,10,0.28)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "rgba(3,147,10,0.28)",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Icon sx={{ color: "#4CB051", fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: "rgba(255,255,255,0.88)", fontSize: "0.93rem", fontWeight: 700, lineHeight: 1.3 }}>
                          {title}
                        </Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.84rem", lineHeight: 1.55 }}>
                          {desc}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>

              {/* Divider */}
              <Box sx={{ height: "1px", background: "rgba(255,255,255,0.07)", mt: 2.5, mb: 2 }} />

              {/* Social proof strip */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {[
                  { value: "10K+", label: "Happy Riders" },
                  { value: "5.0★", label: "Avg Rating" },
                  { value: "24/7", label: "Support" },
                ].map(({ value, label }) => (
                  <Box key={label} sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#4CB051", lineHeight: 1 }}>
                      {value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", mt: 0.4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
                {/* Verified badge */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: "100px",
                    background: "rgba(3,147,10,0.12)",
                    border: "1px solid rgba(3,147,10,0.3)",
                  }}
                >
                  <CheckCircle sx={{ color: "#4CB051", fontSize: 15 }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 600 }}>
                    CA Licensed
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* ── ODA car image ── */}
      {/* <Box
        component="img"
        src={`${process.env.PUBLIC_URL}/1%20Odaa%20car-02.png`}
        alt="ODA premium vehicle"
        sx={{
          position: "absolute",
          bottom: "240px",
          right: { xs: "-20%", sm: "-5%", md: "1%", lg: "6%" },
          width: { xs: "70%", sm: "48%", md: "34%", lg: "30%" },
          maxWidth: "500px",
          objectFit: "contain",
          zIndex: 3,
          filter: "drop-shadow(0 10px 40px rgba(0,0,0,0.6))",
          pointerEvents: "none",
          display: { xs: "none", sm: "block" },
        }}
        onError={(e) => { e.target.style.display = "none"; }}
      /> */}

      {/* ── City skyline ── */}
      <LASkyline />

      {/* ── Road + car lane ── */}
      <RoadSection />
    </HeroContainer>
  );
}

export default Hero;
