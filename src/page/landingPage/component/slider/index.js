import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, IconButton, Container } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ExploreIcon from "@mui/icons-material/Explore";
import { BACKEND_API } from "../../../../store/utils/API";
import { authHeader } from "../../../../util/authUtil";

/* ── keyframes ─────────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(3,147,10,0.4); }
  50%      { box-shadow: 0 0 0 10px rgba(3,147,10,0); }
`;

/* ── styled ─────────────────────────────────────────────────────────────── */

const SectionRoot = styled(Box)({
  position: "relative",
  background: "linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #07111f 100%)",
  overflow: "hidden",
});

const NavArrow = styled(IconButton)(({ disabled }) => ({
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(10px)",
  color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)",
  transition: "all 0.25s ease",
  "&:hover:not(:disabled)": {
    background: "rgba(3,147,10,0.2)",
    borderColor: "rgba(3,147,10,0.55)",
    color: "#4CB051",
    transform: "scale(1.08)",
  },
}));

/* ── skeleton ───────────────────────────────────────────────────────────── */

function Skeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)",
        backgroundSize: "600px 100%",
        animation: `${shimmer} 1.6s infinite linear`,
        borderRadius: 2,
      }}
    />
  );
}

/* ── slide transition variants ──────────────────────────────────────────── */

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "6%" : "-6%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? "-6%" : "6%",
    opacity: 0,
    transition: { duration: 0.4, ease: "easeIn" },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, delay: i * 0.1, ease: "easeOut" },
  }),
};

/* ── dot indicator ──────────────────────────────────────────────────────── */

function DotBar({ total, current, onDotClick }) {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          onClick={() => onDotClick(i)}
          sx={{
            cursor: "pointer",
            height: "3px",
            borderRadius: "2px",
            transition: "all 0.35s ease",
            width: i === current ? "32px" : "10px",
            background:
              i === current
                ? "linear-gradient(90deg, #4CB051, #03930A)"
                : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </Box>
  );
}

/* ── main export ─────────────────────────────────────────────────────────── */

export default function Slider() {
  const [places, setPlaces] = useState([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await BACKEND_API.get("/api/v1/popular-places", authHeader());
        setPlaces(res.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const go = useCallback(
    (next) => {
      setDir(next > index ? 1 : -1);
      setIndex(next);
    },
    [index]
  );

  const prev = useCallback(() => {
    go((index - 1 + places.length) % places.length);
  }, [go, index, places.length]);

  const next = useCallback(() => {
    go((index + 1) % places.length);
  }, [go, index, places.length]);

  useEffect(() => {
    if (places.length < 2) return;
    timerRef.current = setInterval(next, 7000);
    return () => clearInterval(timerRef.current);
  }, [next, places.length]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    timerRef.current = setInterval(next, 7000);
  };

  const current = places[index] ?? places[0];

  return (
    <SectionRoot onMouseEnter={pause} onMouseLeave={resume}>

      {/* ── decorative background blobs ─────────────────────────── */}
      <Box sx={{
        position: "absolute", top: "-20%", left: "-8%",
        width: "45vw", height: "45vw", maxWidth: 600,
        background: "radial-gradient(circle, rgba(3,147,10,0.1) 0%, transparent 68%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <Box sx={{
        position: "absolute", bottom: "-10%", right: "-6%",
        width: "35vw", height: "35vw", maxWidth: 480,
        background: "radial-gradient(circle, rgba(3,147,10,0.07) 0%, transparent 68%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 } }}>

        {/* ── section heading ──────────────────────────────────── */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.2 }}>
            <Box sx={{
              width: 36, height: 3, borderRadius: 2,
              background: "linear-gradient(90deg, #03930A, #4CB051)",
            }} />
            <Typography sx={{
              color: "#4CB051", fontSize: "0.82rem", fontWeight: 700,
              letterSpacing: "2.5px", textTransform: "uppercase",
            }}>
              Popular Destinations
            </Typography>
          </Box>
          <Typography sx={{
            color: "#fff",
            fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.8px",
          }}>
            Where We Take You
          </Typography>
          <Typography sx={{
            color: "rgba(255,255,255,0.45)",
            fontSize: { xs: "0.98rem", md: "1.08rem" },
            mt: 0.8, maxWidth: 480, lineHeight: 1.7,
          }}>
            From California & Washington's coastlines to every corner of the USA — in style.
          </Typography>
        </Box>

        {/* ── main slide card ───────────────────────────────────── */}
        {loading ? (
          <Box sx={{ height: { xs: 340, md: 420 }, borderRadius: 4, overflow: "hidden" }}>
            <Skeleton />
          </Box>
        ) : places.length === 0 ? (
          <Box sx={{
            height: 340, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 4,
            border: "1px dashed rgba(255,255,255,0.1)",
          }}>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "1rem" }}>
              No destinations available
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            position: "relative",
            borderRadius: { xs: 3, md: 4 },
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
            minHeight: { xs: 340, sm: 400, md: 460 },
            display: "flex",
          }}>

            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={index}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ position: "absolute", inset: 0, display: "flex" }}
              >
                <SlideCard place={current} index={index} total={places.length} />
              </motion.div>
            </AnimatePresence>

            {/* invisible sizing placeholder */}
            <Box sx={{ visibility: "hidden", flex: 1, minHeight: { xs: 340, sm: 400, md: 460 } }} />
          </Box>
        )}

        {/* ── controls row ──────────────────────────────────────── */}
        {!loading && places.length > 1 && (
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3.5,
            px: { xs: 0, md: 0.5 },
          }}>
            {/* slide counter */}
            <Typography sx={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}>
              <Box component="span" sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                {String(index + 1).padStart(2, "0")}
              </Box>
              {" / "}
              {String(places.length).padStart(2, "0")}
            </Typography>

            {/* dots */}
            <DotBar total={places.length} current={index} onDotClick={go} />

            {/* arrows */}
            <Box sx={{ display: "flex", gap: 1.2 }}>
              <NavArrow onClick={prev} size="small">
                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
              </NavArrow>
              <NavArrow onClick={next} size="small">
                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
              </NavArrow>
            </Box>
          </Box>
        )}
      </Container>
    </SectionRoot>
  );
}

/* ── slide card ─────────────────────────────────────────────────────────── */

function SlideCard({ place, index }) {
  const [loaded, setLoaded] = useState(false);
  const num = String(index + 1).padStart(2, "0");
  if (!place) return null;
  const { image, title, description } = place;

  // Even index → image left, content right
  // Odd index  → image right, content left
  const isReversed = index % 2 !== 0;

  return (
    <Box sx={{
      display: "flex",
      width: "100%",
      flexDirection: { xs: "column", md: isReversed ? "row-reverse" : "row" },
    }}>

      {/* ── image pane ─────────────────────────────────────────── */}
      <Box sx={{
        flex: { xs: "0 0 240px", sm: "0 0 280px", md: "0 0 58%" },
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 240, sm: 280, md: "unset" },
        background: "#0a1628",
      }}>
        {/* image — clean, no side shadow */}
        <Box
          component="img"
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.7s ease, transform 8s ease",
            transform: "scale(1.04)",
            "&:hover": { transform: "scale(1.0)" },
          }}
        />

        {/* subtle bottom vignette only — keeps pin badge readable */}
        <Box sx={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(6,13,26,0.65) 0%, transparent 40%)",
          pointerEvents: "none",
        }} />

        {/* outer-corner L accent — flips with layout */}
        {isReversed ? (
          <>
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 80, height: 3, background: "linear-gradient(270deg, #03930A, transparent)" }} />
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 3, height: 80, background: "linear-gradient(180deg, #03930A, transparent)" }} />
          </>
        ) : (
          <>
            <Box sx={{ position: "absolute", top: 0, left: 0, width: 80, height: 3, background: "linear-gradient(90deg, #03930A, transparent)" }} />
            <Box sx={{ position: "absolute", top: 0, left: 0, width: 3, height: 80, background: "linear-gradient(180deg, #03930A, transparent)" }} />
          </>
        )}

        {/* location pin badge — hugs the outer bottom corner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: 18,
            ...(isReversed ? { right: 18 } : { left: 18 }),
          }}
        >
          <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            px: 1.8, py: 0.8,
            borderRadius: "100px",
            background: "rgba(6,13,26,0.75)",
            border: "1px solid rgba(3,147,10,0.45)",
            backdropFilter: "blur(12px)",
          }}>
            <LocationOnIcon sx={{ color: "#4CB051", fontSize: 15 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.3px" }}>
              {title}
            </Typography>
          </Box>
        </motion.div>

        {!loaded && (
          <Box sx={{ position: "absolute", inset: 0 }}>
            <Skeleton />
          </Box>
        )}
      </Box>

      {/* ── content pane ───────────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        background: "linear-gradient(145deg, #0d1a2e 0%, #0a1424 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        p: { xs: 3, sm: 4, md: 5, lg: 6 },
        position: "relative",
        overflow: "hidden",
      }}>

        {/* decorative large number — sits on the image-facing side */}
        <Typography
          aria-hidden
          sx={{
            position: "absolute",
            top: "50%",
            ...(isReversed ? { left: { xs: -10, md: 8 } } : { right: { xs: -10, md: 8 } }),
            transform: "translateY(-50%)",
            fontSize: { xs: "7rem", md: "11rem" },
            fontWeight: 900,
            color: "rgba(255,255,255,0.03)",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            letterSpacing: "-4px",
          }}
        >
          {num}
        </Typography>

        {/* outer-corner accent on content pane — mirrors image pane */}
        {isReversed ? (
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 60, height: 3, background: "linear-gradient(90deg, rgba(3,147,10,0.3), transparent)" }} />
        ) : (
          <Box sx={{ position: "absolute", top: 0, right: 0, width: 60, height: 3, background: "linear-gradient(270deg, rgba(3,147,10,0.3), transparent)" }} />
        )}

        {/* slide number badge */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={textVariants}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(3,147,10,0.15)",
              border: "1px solid rgba(3,147,10,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: `${pulse} 2.5s ease-in-out infinite`,
            }}>
              <ExploreIcon sx={{ color: "#4CB051", fontSize: 14 }} />
            </Box>
            <Typography sx={{ color: "#4CB051", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
              Destination {num}
            </Typography>
          </Box>
        </motion.div>

        {/* title */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={textVariants}>
          <Typography sx={{
            color: "#ffffff",
            fontSize: { xs: "1.7rem", sm: "2rem", md: "2.4rem", lg: "2.8rem" },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
            mb: 1.5,
          }}>
            {title}
          </Typography>
        </motion.div>

        {/* green accent line */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={textVariants}>
          <Box sx={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #03930A, #4CB051)", mb: 2.5 }} />
        </motion.div>

        {/* description */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={textVariants}>
          <Typography sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: { xs: "0.97rem", md: "1.07rem" },
            lineHeight: 1.8,
            maxWidth: 360,
          }}>
            {description}
          </Typography>
        </motion.div>

        {/* bottom stat strip */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={textVariants}>
          <Box sx={{
            mt: 4, pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            {[
              { value: "24/7", label: "Service" },
              { value: "5★",   label: "Rating"  },
              { value: "Consistent", label: "Pricing" },
            ].map(({ value, label }) => (
              <Box key={label}>
                <Typography sx={{ color: "#4CB051", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1 }}>
                  {value}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.8px", mt: 0.3 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
